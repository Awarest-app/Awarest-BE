import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Survey } from '@/entities/survey.entity';
import { UserQuestion } from '@/entities/user-question.entity';

import { RedisService } from '@/redis/redis.service';
import { Answer } from '@/entities/answer.entity';
import { Profile } from '@/entities/profile.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepo: Repository<Survey>,

    @InjectRepository(QuestionMapping)
    private questionMapRepo: Repository<QuestionMapping>,

    @InjectRepository(Question)
    private questionRepo: Repository<Question>,

    @InjectRepository(UserQuestion)
    private userQuestionRepo: Repository<UserQuestion>,

    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    private readonly redisService: RedisService,

    // private readonly connection: Connection, // 트랜잭션을 위해 Connection 주입
    private readonly dataSource: DataSource, // 트랜잭션을 위해 Connection 주입
  ) {}

  /**
   * 현재 날짜를 'YYYY-MM-DD' 형식의 문자열로 반환
   */
  private getCurrentDateStr(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // 1) Redis에서 "오늘의 질문 세트"를 가져오거나, 없으면 생성해서 반환한다.
  async getTodayQuestionsForUser(
    userId: number,
  ): Promise<{ questionId: number; answered: boolean }[]> {
    const client = this.redisService.getClient();

    const redisKey = `user_daily_questions:${userId}`;
    const todayStr = this.getCurrentDateStr(); // 오늘 날짜 문자열

    console.log('todayStr', todayStr);

    // 1) Redis에서 기존 세트 조회
    const data = await client.get(redisKey);
    if (data) {
      // Redis에 데이터가 있을 경우
      const parsed = JSON.parse(data);

      // 1-1) 날짜가 "오늘"과 같다면 그대로 반환
      if (parsed.date === todayStr) {
        return parsed.questions;
      }

      // 1-2) 날짜가 달라졌다면 (이미 어제가 됨)
      //      -> "안 쓴 질문"(answered=false)을 가져와서 새로 3개를 만들고, Redis 갱신
      const leftover = parsed.questions.filter((q) => q.answered === false);

      // leftover questionId 배열
      const leftoverIds = leftover.map((q) => q.questionId);

      // 새로 뽑아야 할 질문 개수
      const neededCount = 3 - leftover.length;

      // neededCount만큼 새 질문을 가중치 기반으로 뽑아오기
      const newQuestionIds = await this.getNewQuestionIds(
        userId,
        leftoverIds,
        neededCount,
      );

      // leftover + newQuestions 합쳐서 총 3개 구성
      const merged = [
        ...leftover.map((q) => ({ questionId: q.questionId, answered: false })),
        ...newQuestionIds.map((id) => ({ questionId: id, answered: false })),
      ];

      // Redis에 새로 저장
      const newData = {
        date: todayStr,
        questions: merged,
      };
      await client.set(redisKey, JSON.stringify(newData));

      return newData.questions;
    } else {
      // 2) Redis에 데이터가 전혀 없을 때
      //    -> 새로 3개 뽑아서 저장
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

  // 2) 특정 질문에 답변 완료 처리
  async answerQuestion(userId: number, questionId: number): Promise<void> {
    const client = this.redisService.getClient();
    const redisKey = `user_daily_questions:${userId}`;
    const data = await client.get(redisKey);
    if (!data) return; // 오늘 세트가 아예 없으면 그냥 반환

    const parsed = JSON.parse(data);
    const updatedQuestions = parsed.questions.map((q) => {
      if (q.questionId === questionId) {
        return { ...q, answered: true };
      }
      return q;
    });

    // Redis에 업데이트
    await client.set(
      redisKey,
      JSON.stringify({
        ...parsed,
        questions: updatedQuestions,
      }),
    );

    // DB에도 "사용자가 이 질문을 답변했다"는 기록을 남기고 싶다면
    // 예: UserQuestion 테이블에 insert
    await this.userQuestionRepo.save({
      userId,
      questionId,
      // 필요한 다른 컬럼도 설정
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * leftover를 제외한 새 질문 neededCount개 뽑아서 questionId 배열로 반환
   * 실제 질문 로직(가중치 기반)은 아래에서 재활용
   */
  private async getNewQuestionIds(
    userId: number,
    excludeQuestionIds: number[],
    neededCount: number,
  ): Promise<number[]> {
    if (neededCount <= 0) return [];

    // (기존에 작성하셨던 가중치 로직)
    // 1) 사용자 설문 정보 가져오기
    const survey = await this.surveyRepo.findOne({ where: { userId } });
    if (!survey) {
      return [];
    }
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
    if (orConditions.length === 0) {
      return [];
    }

    // 2) question_mapping에서 조건에 맞는 레코드 검색
    const mappings = await this.questionMapRepo.find({ where: orConditions });

    // 3) 이미 유저가 DB 상에서 사용한 적 있는 questionId도 제외
    const userQuestions = await this.userQuestionRepo.find({
      where: { userId },
    });
    const userQuestionIds = userQuestions.map((uq) => uq.questionId);

    // 4) excludeQuestionIds( leftover ) + userQuestionIds 를 전부 제외
    const allExcluded = new Set([...excludeQuestionIds, ...userQuestionIds]);

    const filteredMappings = mappings.filter(
      (map) => !allExcluded.has(map.questionId),
    );

    // 5) questionId별로 가중치 합산
    const weightMap: Record<number, number> = {};
    for (const map of filteredMappings) {
      if (!weightMap[map.questionId]) {
        weightMap[map.questionId] = 0;
      }
      weightMap[map.questionId] += map.weight;
    }

    // 6) 가중치가 부여된 questionId 들만
    const questionIds = Object.keys(weightMap).map(Number);
    if (questionIds.length === 0) {
      return [];
    }

    // 실제 Question 테이블에 있는지 확인
    const questions = await this.questionRepo.findByIds(questionIds);
    // 질문이 존재하는 questionIds만
    const validQuestionIds = questions.map((q) => q.questionId);

    // 7) 가중치 내림차순 정렬
    validQuestionIds.sort((a, b) => weightMap[b] - weightMap[a]);

    // 8) neededCount만큼 잘라서 반환
    return validQuestionIds.slice(0, neededCount);
  }

  async getQuestionsByIds(questionIds: number[]): Promise<Question[]> {
    if (questionIds.length === 0) return [];

    // In 연산자를 사용하여 주어진 ID 배열에 해당하는 엔티티를 검색
    const questions = await this.questionRepo.findBy({
      questionId: In(questionIds),
    });

    return questions;
  }

  // /**
  //  * 여러 개의 답변을 생성 및 저장
  //  * @param userId 사용자 ID
  //  * @param answersData 답변 데이터 배열
  //  */
  // async createAnswers(
  //   userId: number,
  //   answersData: Partial<Answer>[],
  // ): Promise<Answer[]> {
  //   const answers = answersData.map((item) => {
  //     return this.answerRepo.create({
  //       subquestionId: item.subquestionId,
  //       content: (item as any).answer, // 'answer'를 'content'로 매핑
  //       userId,
  //     });
  //   });

  //   return this.answerRepo.save(answers);
  // }

  /**
   * 여러 개의 답변을 생성 및 저장
   * @param userId 사용자 ID
   * @param answersData 답변 데이터 배열
   */
  async createAnswers(
    userId: number,
    answersData: Partial<Answer>[],
  ): Promise<Answer[]> {
    const answers = answersData.map((item) => {
      return this.answerRepo.create({
        subquestionId: item.subquestionId,
        content: (item as any).answer, // 'answer'를 'content'로 매핑
        userId,
      });
    });

    return this.answerRepo.save(answers);
  }

  /**
   * 유저가 여러 개의 답변을 제출
   * @param userId 사용자 ID
   * @param answersData 답변 데이터 배열 (subquestionId와 answer 내용)
   */
  async submitAnswers(
    userId: number,
    answersData: { subquestionId: number; answer: string }[],
  ): Promise<void> {
    const client = this.redisService.getClient();
    const redisKey = `user_daily_questions:${userId}`;
    const todayStr = this.getCurrentDateStr(); // 오늘 날짜 문자열

    // 트랜잭션 시작
    await this.dataSource.transaction(async (manager) => {
      // Redis에서 현재 질문 세트 가져오기
      const data = await client.get(redisKey);
      if (!data) {
        throw new BadRequestException('오늘의 질문 세트가 존재하지 않습니다.');
      }

      const parsed = JSON.parse(data) as {
        date: string;
        questions: { questionId: number; answered: boolean }[];
      };

      if (parsed.date !== todayStr) {
        throw new BadRequestException(
          '질문 세트의 날짜가 오늘과 일치하지 않습니다.',
        );
      }

      let anyAnsweredChanged = false;

      // 질문 ID를 키로 하는 맵 생성
      const questionMap = new Map<
        number,
        { questionId: number; answered: boolean }
      >();
      parsed.questions.forEach((q) => questionMap.set(q.questionId, q));

      // 제출된 답변을 기반으로 Redis 업데이트
      answersData.forEach((a) => {
        const q = questionMap.get(a.subquestionId);
        if (q && !q.answered) {
          q.answered = true;
          anyAnsweredChanged = true;
        }
      });

      // Redis에 업데이트된 질문 세트 저장
      await client.set(
        redisKey,
        JSON.stringify({
          ...parsed,
          questions: Array.from(questionMap.values()),
        }),
      );

      // 답변 상태가 변경되었을 경우 추가 작업 수행
      if (anyAnsweredChanged) {
        // 사용자 프로필 가져오기
        const profile = await manager.findOne(Profile, { where: { userId } });
        if (!profile) {
          throw new BadRequestException('사용자의 프로필을 찾을 수 없습니다.');
        }

        const today = new Date();
        const lastStreakDate = profile.lastStreakDate
          ? new Date(profile.lastStreakDate)
          : null;

        const isSameDay =
          lastStreakDate &&
          lastStreakDate.toDateString() === today.toDateString();

        if (!isSameDay) {
          // day_streak 증가 및 lastStreakDate 업데이트
          profile.day_streak += 1;
          profile.lastStreakDate = today;
          await manager.save(profile);
        }

        // 제출된 답변을 DB에 저장
        const answerEntities = answersData.map((a) => {
          return this.answerRepo.create({
            subquestionId: a.subquestionId,
            content: a.answer,
            userId,
            // user: { userId } as User,
          });
        });

        await manager.save(answerEntities);

        // UserQuestion 엔티티 업데이트: answered 필드 설정
        // const subquestionIds = answersData.map((a) => a.subquestionId);
        // await manager.update(
        //   UserQuestion,
        //   { userId, subquestionId: In(subquestionIds) },
        //   // { answered: true },
        // );
      }
    });
  }
}
