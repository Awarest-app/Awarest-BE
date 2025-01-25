// import { QuestionMapping } from '@/entities/question-mapping.entity';
// import { Question } from '@/entities/question.entity';
// import { Survey } from '@/entities/survey.entity';
// import { UserQuestion } from '@/entities/user-question.entity';
// import { RedisService } from '@liaoliaots/nestjs-redis';
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// // import { InjectRedis } from '@liaoliaots/nestjs-redis';
// // import { InjectRedis } from '@liaoliaots/nestjs-redis/dist/redis.decorators';

// @Injectable()
// export class QuestionService {
//   constructor(
//     @InjectRepository(Survey)
//     private surveyRepo: Repository<Survey>,

//     @InjectRepository(QuestionMapping)
//     private questionMapRepo: Repository<QuestionMapping>,

//     @InjectRepository(Question)
//     private questionRepo: Repository<Question>,

//     @InjectRepository(UserQuestion)
//     private userQuestionRepo: Repository<UserQuestion>,

//     private readonly redisService: RedisService,
//   ) {}

//   async getQuestionsForUser(userId: number): Promise<Question[]> {
//     // 1) 사용자 설문 정보 가져오기
//     const survey = await this.surveyRepo.findOne({ where: { userId } });
//     if (!survey) {
//       return [];
//     }
//     // console.log('survey', survey);

//     // 2) (Partial)Mapping 레코드를 가져올 조건 만들기 - (OR 조건)
//     //    - survey에 들어있는 항목들만 추출
//     const orConditions = [];
//     if (survey.ageRange) {
//       orConditions.push({
//         categoryName: 'age_range',
//         categoryValue: survey.ageRange,
//       });
//     }
//     if (survey.job) {
//       orConditions.push({ categoryName: 'job', categoryValue: survey.job });
//     }
//     if (survey.goal) {
//       orConditions.push({ categoryName: 'goal', categoryValue: survey.goal });
//     }
//     if (orConditions.length === 0) {
//       return []; // 아무 항목도 없으면 반환
//     }
//     console.log('orConditions', orConditions);

//     // 3) question_mapping에서 조건에 맞는 레코드(OR) 검색
//     const mappings = await this.questionMapRepo.find({ where: orConditions });
//     // 예: (age_range=20대, job=학생, goal=다이어트)에 해당되는 레코드가 있으면 전부 가져옴.
//     console.log('mappings', mappings);

//     // 4) 이미 사용자의 UserQuestion 테이블에 있는 questionId 가져오기
//     const userQuestions = await this.userQuestionRepo.find({
//       where: { userId },
//     });
//     const userQuestionIds = userQuestions.map((uq) => uq.questionId);
//     console.log('userQuestionIds', userQuestionIds);

//     // 5) userQuestionRepo에 있는 questionId를 제외한 mappings 필터링
//     const filteredMappings = mappings.filter(
//       (map) => !userQuestionIds.includes(map.questionId),
//     );
//     console.log('filteredMappings', filteredMappings);

//     // 6) questionId 별로 가중치 합산하기
//     //    - 예) (20대=2, 학생=3, 다이어트=2) -> total=7
//     const weightMap: Record<number, number> = {};
//     for (const map of filteredMappings) {
//       if (!weightMap[map.questionId]) {
//         weightMap[map.questionId] = 0;
//       }
//       weightMap[map.questionId] += map.weight;
//     }

//     // 7) 가중치가 부여된 questionId 들만 실제 Question 테이블에서 조회
//     const questionIds = Object.keys(weightMap).map((idStr) =>
//       parseInt(idStr, 10),
//     );
//     if (questionIds.length === 0) {
//       return [];
//     }

//     const questions = await this.questionRepo.findByIds(questionIds);

//     questions.sort((a, b) => weightMap[b.questionId] - weightMap[a.questionId]);

//     // 8) 반환
//     return questions;
//   }
// }

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Survey } from '@/entities/survey.entity';
import { UserQuestion } from '@/entities/user-question.entity';

// 날짜 형식 처리를 위해 dayjs 사용 (선택사항)
import dayjs from 'dayjs';
import { RedisService } from '@/redis/redis.service';

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

    private readonly redisService: RedisService,
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
}
