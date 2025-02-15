import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { UserQuestion } from '@/entities/user-question.entity';
import { Subquestion } from '@/entities/subquestion.entity';
import {
  ageGroups,
  goalOptions,
  workWordsOptions,
} from '@/survey/enum/survey.enum';
import { QuestionMapping } from '@/entities/question-mapping.entity';

@Injectable()
export class QuestionManagementService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(UserQuestion)
    private readonly userQuestionRepo: Repository<UserQuestion>,
    @InjectRepository(Subquestion)
    private readonly subQuestionRepo: Repository<Subquestion>,
    @InjectRepository(Subquestion)
    private readonly questionMappingRepo: Repository<QuestionMapping>,
  ) {}

  /**
   * 모든 질문 목록을 조회하는 함수
   * @returns 질문 목록 (questionId, content, depth만 포함)
   */
  getAllQuestions(): Promise<Partial<Question>[]> {
    return this.questionRepo.find({
      select: ['questionId', 'content', 'depth'],
      order: { questionId: 'ASC' },
    });
  }

  /**
   * 특정 질문의 내용과 깊이를 업데이트하는 함수
   * @param questionId 질문 ID
   * @param content 새로운 질문 내용
   * @param depth 새로운 깊이 값
   */
  async updateQuestion(
    questionId: number,
    content: string,
    depth: number,
  ): Promise<Partial<Question> | null> {
    // 질문 존재 여부 확인
    const question = await this.questionRepo.findOne({ where: { questionId } });
    if (!question) {
      throw new NotFoundException('해당 questionId를 찾을 수 없습니다.');
    }

    // 질문 업데이트
    await this.questionRepo.update({ questionId }, { content, depth });
    return { questionId, content, depth };
  }

  /**
   * 특정 ID 목록에 해당하는 질문들을 조회하는 함수
   * @param userId 사용자 ID (이미 답변한 질문 제외용)
   * @param questionIds 조회할 질문 ID 배열
   */
  async getQuestionsByIds(
    userId: number,
    questionIds: number[],
  ): Promise<Question[]> {
    if (questionIds.length === 0) return [];

    // 사용자가 이미 답변한 질문 ID 조회
    const usedQuestionIds = await this.userQuestionRepo
      .find({
        where: {
          userId,
          questionId: In(questionIds),
        },
        select: ['questionId'],
      })
      .then((uqs) => uqs.map((uq) => uq.questionId));

    // 답변하지 않은 질문만 필터링
    const filteredQuestionIds = questionIds.filter(
      (id) => !usedQuestionIds.includes(id),
    );

    if (filteredQuestionIds.length === 0) return [];

    // 필터링된 질문 목록 조회
    return this.questionRepo.findBy({
      questionId: In(filteredQuestionIds),
    });
  }

  /**
   * 새 질문과 해당 subquestion들을 저장합니다.
   * @param questionContent 질문 내용
   * @param subquestions subquestion 문자열 배열
   */
  async createQuestion(
    questionContent: string,
    subquestions: string[],
    depth: number,
  ): Promise<Question> {
    // 1. 질문 저장
    console.log('outer createQuestion', questionContent, subquestions, depth);
    const question = this.questionRepo.create({
      content: questionContent,
      depth: depth,
    });
    const savedQuestion = await this.questionRepo.save(question);
    console.log('savedQuestion', savedQuestion);

    // 2. subquestion들을 순서(order)를 부여하면서 저장
    for (let i = 0; i < subquestions.length; i++) {
      console.log('subquestions [i]', subquestions[i]);
      if (subquestions[i] == null) {
        console.warn(
          `Subquestion at index ${i} is null or undefined. Skipping...`,
        );
        continue;
      }

      const subq = this.subQuestionRepo.create({
        questionId: savedQuestion.questionId,
        content: subquestions[i],
      });
      await this.subQuestionRepo.save(subq);
    }

    console.log('categoryOptions');
    // 각 카테고리별 옵션 설정
    const categoryOptions = [
      { categoryName: 'age', options: ageGroups },
      { categoryName: 'goal', options: goalOptions },
      { categoryName: 'job', options: workWordsOptions },
    ];

    // 각 카테고리의 옵션을 순회하며 매핑 생성
    const mappings = categoryOptions.flatMap(({ categoryName, options }) =>
      options.map((option) =>
        this.questionMappingRepo.create({
          categoryName,
          categoryValue: option,
          weight: 5,
          questionId: savedQuestion.questionId,
          // depth: String(depth),
        }),
      ),
    );

    // 생성된 모든 mapping 저장
    await this.questionMappingRepo.save(mappings);

    return savedQuestion;
  }
}
