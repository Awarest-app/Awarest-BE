// src/subquestion/subquestion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subquestion } from '@/entities/subquestion.entity';
import { Repository } from 'typeorm';
import { Question } from '@/entities/question.entity';

@Injectable()
export class SubquestionService {
  constructor(
    @InjectRepository(Subquestion)
    private readonly subqRepo: Repository<Subquestion>,

    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}

  async create(questionId: number, content: string): Promise<Subquestion> {
    // 새로운 Subquestion 생성
    const subq = this.subqRepo.create({
      questionId,
      content,
    });

    return this.subqRepo.save(subq);
  }

  async findById(questionId: number): Promise<{
    question: string;
    subquestions: { id: number; text: string }[];
  }> {
    // 1. questionId로 Question 엔티티 조회
    const question = await this.questionRepo.findOne({
      where: { questionId }, // question.entity.ts에서 PK가 questionId
    });

    if (!question) {
      throw new NotFoundException(`Question with id=${questionId} not found`);
    }

    // 2. questionId로 Subquestion 배열 조회
    const subquestions = await this.subqRepo.find({
      where: { questionId },
    });

    // 3. 최종 반환 구조 만들기
    return {
      question: question.content,
      subquestions: subquestions.map((subq) => ({
        id: subq.subquestionId,
        text: subq.content,
      })),
    };
  }

  async remove(id: number): Promise<void> {
    await this.subqRepo.delete(id);
  }

  async findSubquestion(questionId: number): Promise<Partial<Subquestion>[]> {
    return await this.subqRepo.find({
      where: { questionId },
      select: ['subquestionId', 'content'], // 필요한 필드만 선택
    });
  }

  async update(id: number, updateDto: string): Promise<Subquestion> {
    const subq = await this.subqRepo.findOne({ where: { subquestionId: id } });
    subq.content = updateDto;
    return this.subqRepo.save(subq);
  }

  /**
   * 새 질문과 해당 subquestion들을 저장합니다.
   * @param questionContent 질문 내용
   * @param subquestions subquestion 문자열 배열
   */
  async createQuestion(
    questionContent: string,
    subquestions: string[],
  ): Promise<Question> {
    // 1. 질문 저장
    const question = this.questionRepo.create({
      content: questionContent,
    });
    const savedQuestion = await this.questionRepo.save(question);

    // 2. subquestion들을 순서(order)를 부여하면서 저장
    for (let i = 0; i < subquestions.length; i++) {
      const subq = this.subqRepo.create({
        questionId: savedQuestion.questionId, // FK 연결
        content: subquestions[i],
        // order: i + 1, // 순번 부여 (1부터 시작)
      });
      await this.subqRepo.save(subq);
    }

    return savedQuestion;
  }
}
