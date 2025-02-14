import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '@/entities/answer.entity';
import { Question } from '@/entities/question.entity';
import { Profile } from '@/entities/profile.entity';
import { UserQuestion } from '@/entities/user-question.entity';
import { DailyQuestionService } from './daily-question.service';
import { ProfileXpService } from '@/profile/profile-xp.service';

@Injectable()
export class AnswerManagementService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepo: Repository<Answer>,
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(UserQuestion)
    private readonly userQuestionRepo: Repository<UserQuestion>,
    private readonly dailyQuestionService: DailyQuestionService,
    private readonly profileXpService: ProfileXpService,
  ) {}

  /**
   * 사용자의 답변 이력을 질문별로 그룹화하여 조회
   * @param userId 사용자 ID
   */
  async getAnswersByUserOrdered(userId: number): Promise<
    {
      question: string;
      subquestions: { text: string; answer: string; date: Date; id: number }[];
    }[]
  > {
    // 사용자의 모든 답변 조회
    const answers = await this.answerRepo.find({
      where: { userId },
      relations: ['subquestion', 'subquestion.question'],
    });

    if (!answers.length) {
      return [];
    }

    // 질문별로 답변 그룹화
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
        lastSubmittedAt: Date;
      }
    >();

    // 답변을 질문별로 정리
    for (const ans of answers) {
      const subq = ans.subquestion;
      const q = subq.question;

      if (!questionMap.has(q.questionId)) {
        questionMap.set(q.questionId, {
          question: q.content,
          subquestions: [],
          lastSubmittedAt: ans.submittedAt,
        });
      }

      const group = questionMap.get(q.questionId);
      group.subquestions.push({
        text: subq.content,
        answer: ans.content,
        date: ans.submittedAt,
        id: ans.subquestionId,
      });

      if (ans.submittedAt > group.lastSubmittedAt) {
        group.lastSubmittedAt = ans.submittedAt;
      }
    }

    // 최근 답변 순으로 정렬하여 반환
    return Array.from(questionMap.values())
      .sort((a, b) => b.lastSubmittedAt.getTime() - a.lastSubmittedAt.getTime())
      .map((item) => ({
        question: item.question,
        subquestions: item.subquestions,
      }));
  }

  /**
   * 여러 개의 답변을 한 번에 제출하고 XP를 계산하는 함수
   * @param userId 사용자 ID
   * @param answersData 답변 데이터 배열
   * @param questionName 질문 이름
   */
  async submitAnswers(
    userId: number,
    answersData: { subquestionId: number; answer: string }[],
    questionName: string,
  ): Promise<number> {
    // 질문 조회
    const question = await this.questionRepo.findOne({
      where: { content: questionName },
    });
    if (!question) {
      throw new BadRequestException('해당 질문을 찾을 수 없습니다.');
    }

    // 답변 생성
    const answerEntities = answersData.map((a) =>
      this.answerRepo.create({
        subquestionId: a.subquestionId,
        content: a.answer,
        userId,
      }),
    );

    // 프로필 조회
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new BadRequestException('사용자의 프로필을 찾을 수 없습니다.');
    }

    // 답변 저장 및 XP 계산
    await this.answerRepo.save(answerEntities);
    await this.dailyQuestionService.markQuestionAsAnswered(
      userId,
      question.questionId,
    );

    // XP 계산 및 프로필 업데이트
    const xpToAdd = question.depth < 5 ? 50 : 80;
    await this.profileXpService.updateXpAndLevel(profile, xpToAdd, 1);
    await this.profileXpService.updateStreak(profile);

    return xpToAdd;
  }

  /**
   * 여러 개의 답변을 생성하는 함수
   * @param userId 사용자 ID
   * @param answersData 답변 데이터 배열
   */
  async createAnswers(
    userId: number,
    answersData: Partial<Answer>[],
  ): Promise<Answer[]> {
    const answers = answersData.map((item) =>
      this.answerRepo.create({
        subquestionId: item.subquestionId,
        content: (item as any).answer,
        userId,
      }),
    );

    return this.answerRepo.save(answers);
  }
}
