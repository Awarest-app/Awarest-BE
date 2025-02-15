import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Survey } from '@/entities/survey.entity';
import { UserQuestion } from '@/entities/user-question.entity';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class DailyQuestionService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,
    @InjectRepository(QuestionMapping)
    private readonly questionMapRepo: Repository<QuestionMapping>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(UserQuestion)
    private readonly userQuestionRepo: Repository<UserQuestion>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 현재 날짜를 'YYYY-MM-DD' 형식의 문자열로 반환
   */
  private getCurrentDateStr(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 사용자의 설문 응답과 가중치를 기반으로 새로운 질문 ID들을 가져오는 함수
   * @param userId 사용자 ID
   * @param excludeQuestionIds 제외할 질문 ID 배열
   * @param neededCount 필요한 질문 개수
   */
  private async getNewQuestionIds(
    userId: number,
    excludeQuestionIds: number[],
    neededCount: number,
  ): Promise<number[]> {
    if (neededCount <= 0) return [];

    // 사용자 설문 정보 조회
    const survey = await this.surveyRepo.findOne({ where: { userId } });
    if (!survey) return [];

    // 설문 응답에 따른 조건 생성
    const orConditions = [];
    if (survey.ageRange) {
      orConditions.push({
        categoryName: 'age_range',
        categoryValue: survey.ageRange,
      });
    }
    if (survey.job) {
      orConditions.push({ categoryName: 'job', categoryValue: survey.job });
    }
    if (survey.goal) {
      orConditions.push({ categoryName: 'goal', categoryValue: survey.goal });
    }
    if (orConditions.length === 0) return [];

    // 질문 매핑 정보 조회, 하나라도 survey가 겹치면 가져옴
    const mappings = await this.questionMapRepo.find({ where: orConditions });

    // 이미 답변한 질문 제외
    const userQuestions = await this.userQuestionRepo.find({
      where: { userId },
    });
    const userQuestionIds = userQuestions.map((uq) => uq.questionId);
    const allExcluded = new Set([...excludeQuestionIds, ...userQuestionIds]);

    const filteredMappings = mappings.filter(
      (map) => !allExcluded.has(map.questionId),
    );

    // 가중치 계산
    const weightMap: Record<number, number> = {};
    for (const map of filteredMappings) {
      if (!weightMap[map.questionId]) {
        weightMap[map.questionId] = 0;
      }
      weightMap[map.questionId] += map.weight;
    }

    let validQuestionIds: number[] = [];
    const questionIdsFromMapping = Object.keys(weightMap).map(Number);

    // 가중치에 해당하는 question이 3개 이상인 경우
    if (questionIdsFromMapping.length >= 3) {
      // 매핑 데이터가 있는 경우
      const questions = await this.questionRepo.findByIds(
        questionIdsFromMapping,
      );
      validQuestionIds = questions.map((q) => q.questionId);
      validQuestionIds.sort(
        (a, b) => (weightMap[b] ?? 0) - (weightMap[a] ?? 0),
      );
    } else {
      // 매핑 데이터가 없는 경우
      const questions = await this.questionRepo.find({
        where: {
          questionId: Not(In([...allExcluded])),
        },
      });
      validQuestionIds = questions.map((q) => q.questionId);
    }

    return validQuestionIds.slice(0, neededCount);
  }

  /**
   * 사용자의 오늘의 질문 세트를 가져오거나 생성하는 함수
   * @param userId 사용자 ID
   */
  async getTodayQuestionsForUser(
    userId: number,
  ): Promise<{ questionId: number; answered: boolean }[]> {
    const client = this.redisService.getClient();
    const redisKey = `user_daily_questions:${userId}`;
    const todayStr = this.getCurrentDateStr();

    // Redis에서 기존 세트 조회
    const data = await client.get(redisKey);
    if (data) {
      const parsed = JSON.parse(data);

      // 오늘 날짜와 동일하면 그대로 반환
      if (parsed.date === todayStr) {
        return parsed.questions;
      }

      // 날짜가 다르면 미답변 질문 유지하고 새로운 질문 추가
      const leftover = parsed.questions.filter((q) => q.answered === false);
      const leftoverIds = leftover.map((q) => q.questionId);
      const neededCount = 3 - leftover.length;

      const newQuestionIds = await this.getNewQuestionIds(
        userId,
        leftoverIds,
        neededCount,
      );

      const merged = [
        ...leftover,
        ...newQuestionIds.map((id) => ({ questionId: id, answered: false })),
      ];

      const newData = {
        date: todayStr,
        questions: merged,
      };
      await client.set(redisKey, JSON.stringify(newData));
      return newData.questions;
    } else {
      // 새로운 질문 세트 생성
      const newQuestionIds = await this.getNewQuestionIds(userId, [], 3);
      const newData = {
        date: todayStr,
        questions: newQuestionIds.map((id) => ({
          questionId: id,
          answered: false,
        })),
      };
      await client.set(redisKey, JSON.stringify(newData));
      return newData.questions;
    }
  }

  /**
   * 특정 질문에 대한 답변 완료 처리
   * @param userId 사용자 ID
   * @param questionId 질문 ID
   */
  async markQuestionAsAnswered(
    userId: number,
    questionId: number,
  ): Promise<void> {
    const client = this.redisService.getClient();
    const redisKey = `user_daily_questions:${userId}`;
    const data = await client.get(redisKey);
    if (!data) return;

    const parsed = JSON.parse(data);
    const updatedQuestions = parsed.questions.map((q) => {
      if (q.questionId === questionId) {
        return { ...q, answered: true };
      }
      return q;
    });

    await client.set(
      redisKey,
      JSON.stringify({
        ...parsed,
        questions: updatedQuestions,
      }),
    );

    // DB에 답변 기록 저장
    await this.userQuestionRepo.save({
      userId,
      questionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
