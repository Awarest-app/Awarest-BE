import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Survey } from '@/entities/survey.entity';
import { UserQuestion } from '@/entities/user-question.entity';

import { RedisService } from '@/redis/redis.service';
import { Answer } from '@/entities/answer.entity';
import { Profile } from '@/entities/profile.entity';
import { Level } from '@/entities/level.entity';

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

    @InjectRepository(Level) private levelRepository: Repository<Level>,
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
    // console.log('data', data);
    if (data) {
      // Redis에 데이터가 있을 경우
      const parsed = JSON.parse(data);
      console.log('parsed', parsed);

      // 1-1) 날짜가 "오늘"과 같다면 그대로 반환
      if (parsed.date === todayStr) {
        return parsed.questions;
      }

      // 1-2) 날짜가 달라졌다면 (이미 어제가 됨)
      //  -> "안 쓴 질문"(answered=false)을 가져와서 새로 3개를 만들고, Redis 갱신
      const leftover = parsed.questions.filter((q) => q.answered === false);

      // leftover questionId 배열
      const leftoverIds = leftover.map((q) => q.questionId);
      console.log('leftoverIds', leftoverIds);

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

  private async getNewQuestionIds(
    userId: number,
    excludeQuestionIds: number[],
    neededCount: number,
  ): Promise<number[]> {
    if (neededCount <= 0) return [];

    // 1️⃣ 사용자 설문 정보 가져오기
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

    // 2️⃣ question_mapping에서 조건에 맞는 레코드 검색
    const mappings = await this.questionMapRepo.find({ where: orConditions });

    // 3️⃣ 이미 유저가 DB 상에서 사용한 적 있는 questionId도 제외
    const userQuestions = await this.userQuestionRepo.find({
      where: { userId },
    });
    const userQuestionIds = userQuestions.map((uq) => uq.questionId);

    // 4️⃣ excludeQuestionIds와 userQuestionIds를 모두 제외
    const allExcluded = new Set([...excludeQuestionIds, ...userQuestionIds]);

    const filteredMappings = mappings.filter(
      (map) => !allExcluded.has(map.questionId),
    );

    // 5️⃣ questionId별로 가중치 합산
    const weightMap: Record<number, number> = {};
    for (const map of filteredMappings) {
      if (!weightMap[map.questionId]) {
        weightMap[map.questionId] = 0;
      }
      weightMap[map.questionId] += map.weight;
    }

    let validQuestionIds: number[] = [];
    const questionIdsFromMapping = Object.keys(weightMap).map(Number);

    if (questionIdsFromMapping.length > 3) {
      // 6-1) mapping 데이터가 있는 경우:
      // 실제 Question 테이블에 존재하는 questionId들만 필터링
      const questions = await this.questionRepo.findByIds(
        questionIdsFromMapping,
      );
      validQuestionIds = questions.map((q) => q.questionId);

      // 7) 가중치 내림차순 정렬 (매핑이 없으면 해당 값은 0으로 간주)
      validQuestionIds.sort(
        (a, b) => (weightMap[b] ?? 0) - (weightMap[a] ?? 0),
      );
    } else {
      // 6-2) mapping 데이터가 하나도 없는 경우:
      // Question 테이블에서 allExcluded에 포함되지 않는 모든 질문을 가져옴.
      const questions = await this.questionRepo.find({
        where: {
          questionId: Not(In([...allExcluded])),
        },
      });
      validQuestionIds = questions.map((q) => q.questionId);
      // mapping이 없으므로 가중치는 모두 0으로 처리 (정렬은 따로 필요없음)
    }

    // 8️⃣ neededCount만큼 잘라서 반환
    return validQuestionIds.slice(0, neededCount);
  }

  async getQuestionsByIds(
    userId: number,
    questionIds: number[],
  ): Promise<Question[]> {
    if (questionIds.length === 0) return [];

    // 1. 사용자가 이미 답변한 questionIds 가져오기
    const usedQuestionIds = await this.userQuestionRepo
      .find({
        where: {
          userId,
          questionId: In(questionIds),
        },
        select: ['questionId'],
      })
      .then((uqs) => uqs.map((uq) => uq.questionId));

    // 2. 사용된 questionIds 제외하기
    const filteredQuestionIds = questionIds.filter(
      (id) => !usedQuestionIds.includes(id),
    );

    if (filteredQuestionIds.length === 0) return [];

    // 3. 남은 질문들 가져오기
    const questions = await this.questionRepo.findBy({
      questionId: In(filteredQuestionIds),
    });

    return questions;
  }

  async getAnswersByUserOrdered(userId: number): Promise<
    {
      question: string;
      subquestions: { text: string; answer: string; date: Date; id: number }[];
    }[]
  > {
    // 1. 사용자에 해당하는 모든 answer를 조회하면서
    //    subquestion, subquestion.question 관계를 함께 로드
    const answers = await this.answerRepo.find({
      where: { userId },
      relations: ['subquestion', 'subquestion.question'],
    });

    console.log('answers:', answers);

    if (!answers.length) {
      return [];
      // throw new NotFoundException(`No answers found for userId=${userId}`);
    }

    // 2. 질문(question)별로 답변을 그룹화하기 위한 자료구조
    //    key: questionId, value: { question: string, subquestions: [...], lastSubmittedAt: Date }
    const questionMap = new Map<
      number,
      {
        question: string;
        subquestions: {
          text: string;
          answer: string;
          date: Date;
          id: number;
        }[];
        lastSubmittedAt: Date; // 가장 최근 답변 시간
      }
    >();

    for (const ans of answers) {
      const subq = ans.subquestion;
      const q = subq.question; // question entity

      // questionId를 기준으로 그룹이 없다면 초기화
      if (!questionMap.has(q.questionId)) {
        questionMap.set(q.questionId, {
          question: q.content,
          subquestions: [],
          lastSubmittedAt: ans.submittedAt,
        });
      }

      const group = questionMap.get(q.questionId);

      // subquestion 배열에 현재 답변 정보 푸시
      group.subquestions.push({
        text: subq.content,
        answer: ans.content,
        date: ans.submittedAt,
        id: ans.subquestionId,
      });

      // 가장 최근에 답변한 시각 갱신
      if (ans.submittedAt > group.lastSubmittedAt) {
        group.lastSubmittedAt = ans.submittedAt;
      }
    }
    // console.log('questionMap:', questionMap);

    // 3. Map을 배열로 변환하고 "가장 최근 답변 시각" 기준으로 정렬
    const result = Array.from(questionMap.values())
      .sort((a, b) => b.lastSubmittedAt.getTime() - a.lastSubmittedAt.getTime())
      .map((item) => ({
        question: item.question,
        subquestions: item.subquestions.map((sub) => ({
          text: sub.text,
          answer: sub.answer,
          date: sub.date,
          id: sub.id,
        })),
      }));

    return result;
  }

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
   * @param questionName 질문 이름
   * @returns 추가된 XP 값
   */
  async submitAnswers(
    userId: number,
    answersData: { subquestionId: number; answer: string }[],
    questionName: string,
  ): Promise<number> {
    // 반환 타입을 number로 변경
    const client = this.redisService.getClient();
    const redisKey = `user_daily_questions:${userId}`;
    const todayStr = this.getCurrentDateStr(); // 오늘 날짜 문자열

    console.log('questionName', questionName);

    // 트랜잭션 시작
    const xpToAdd = await this.dataSource.transaction(async (manager) => {
      // 트랜잭션 결과를 변수에 할당
      // Redis에서 현재 질문 세트 가져오기
      const data = await client.get(redisKey);
      if (!data) {
        throw new BadRequestException('오늘의 질문 세트가 존재하지 않습니다.');
      }

      console.log('data', data);
      const parsed = JSON.parse(data) as {
        date: string;
        questions: { questionId: number; answered: boolean }[];
      };

      console.log('parsed', parsed);

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

      console.log('questionMap', questionMap);

      // 질문 이름으로 질문 찾기
      const question = await this.questionRepo.findOne({
        where: { content: questionName },
      });
      if (!question) {
        throw new BadRequestException('해당 질문 이름을 찾을 수 없습니다.');
      }
      const questionId = question.questionId;
      console.log('questionId', questionId);

      // 제출된 답변을 기반으로 Redis 업데이트
      const q = questionMap.get(questionId);
      if (q && !q.answered) {
        q.answered = true;
        anyAnsweredChanged = true;
      }
      console.log('q', q);
      console.log('answersData', answersData);

      // Redis에 업데이트된 질문 세트 저장
      await client.set(
        redisKey,
        JSON.stringify({
          ...parsed,
          questions: Array.from(questionMap.values()),
        }),
      );
      console.log('redis1', anyAnsweredChanged);

      // 답변 상태가 변경되었을 경우 추가 작업 수행
      if (anyAnsweredChanged) {
        // 사용자 프로필 가져오기
        const profile = await manager.findOne(Profile, { where: { userId } });
        if (!profile) {
          throw new BadRequestException('사용자의 프로필을 찾을 수 없습니다.');
        }
        // console.log('redis1-1');

        const today = new Date();
        const lastStreakDate = profile.lastStreakDate
          ? new Date(profile.lastStreakDate)
          : null;

        // console.log('redis1-3');
        const isSameDay =
          lastStreakDate &&
          lastStreakDate.toDateString() === today.toDateString();

        // console.log('redis2');
        if (!isSameDay) {
          // day_streak 증가 및 lastStreakDate 업데이트
          profile.day_streak += 1;
          profile.lastStreakDate = today;
          await manager.save(profile);
        }

        // console.log('redis3');
        // 제출된 답변을 DB에 저장
        const answerEntities = answersData.map((a) => {
          return this.answerRepo.create({
            subquestionId: a.subquestionId,
            content: a.answer,
            userId,
            // user: { userId } as User,
          });
        });
        console.log('answerEntities', answerEntities);

        await manager.save(answerEntities);

        // UserQuestion 엔티티 업데이트: answered 필드 설정
        await manager.save(
          UserQuestion,
          { userId, questionId: questionId },
          // { answered: true }, // 필요에 따라 업데이트 방식 조정
        );

        // 추가 요구 사항 처리 시작
        // 1. 질문의 depth 가져오기
        const questionDepth = question.depth;
        // console.log('questionDepth', questionDepth);

        // 2. depth에 따른 XP 계산
        const xpToAdd = questionDepth < 5 ? 50 : 80;

        // 3. total_xp 업데이트
        profile.total_xp += xpToAdd;

        // 4. 총 답변 수 증가
        profile.total_answers += 1;

        // 5. 레벨 업 로직
        // 예: 레벨업 임계값을 현재 레벨 * 100으로 설정

        // const levelUpThreshold = profile.level * 100;
        const levelUpThreshold = await this.levelRepository.findOne({
          where: { level: profile.level },
        });

        if (profile.total_xp >= levelUpThreshold.required_xp) {
          profile.level += 1;
          // profile.total_xp -= levelUpThreshold; // 남은 XP 유지
          // 추가적으로 레벨업 시 필요한 작업이 있다면 여기서 수행
        }

        // 6. 프로필 저장
        await manager.save(profile);

        // 7. 성공한 질문의 XP 반환
        console.log(' inner xpToAdd', xpToAdd);
        return xpToAdd;
      }
      // 답변 상태가 변경되지 않았을 경우 0 반환
      return 0;
    });

    return xpToAdd; // 트랜잭션 결과 반환
  }

  getAllQuestions(): Promise<Partial<Question>[]> {
    return this.questionRepo.find({
      select: ['questionId', 'content', 'depth'],
      order: { questionId: 'ASC' },
    });
  }

  async updateQuestion(
    questionId: number,
    content: string,
    depth: number,
  ): Promise<Partial<Question> | null> {
    // 1️⃣ 먼저 해당 questionId가 존재하는지 확인
    console.log('prev updateQuestion', questionId, content);
    const question = await this.questionRepo.findOne({ where: { questionId } });
    console.log('question', question);
    if (!question) {
      throw new NotFoundException('해당 questionId를 찾을 수 없습니다.');
    }

    // 2️⃣ content 업데이트 실행
    console.log('updateQuestion', questionId, content);
    await this.questionRepo.update({ questionId }, { content, depth });

    return { questionId, content, depth };
  }
}
