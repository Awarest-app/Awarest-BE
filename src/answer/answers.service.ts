// src/answers/answers.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../entities/answer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  // 모든 답변 조회
  async findAll(): Promise<Answer[]> {
    return this.answerRepository.find({ relations: ['subquestion', 'user'] });
  }

  // 특정 답변 조회
  async findOne(id: number): Promise<Answer> {
    const answer = await this.answerRepository.findOne({
      where: { answersId: id },
      relations: ['subquestion', 'user'],
    });
    if (!answer) {
      throw new NotFoundException(`Answer with ID ${id} not found.`);
    }
    return answer;
  }

  // 특정 사용자의 모든 답변 조회
  async findAnswersByUser(userId: number): Promise<Answer[]> {
    return this.answerRepository.find({
      where: { userId },
      relations: ['subquestion', 'user'],
    });
  }

  // 답변 생성
  async createAnswer(answerData: Partial<Answer>): Promise<Answer> {
    const answer = this.answerRepository.create(answerData);
    return this.answerRepository.save(answer);
  }

  // // 여러 Answer 생성
  async createAnswers(userId: number, answersData: Partial<Answer>[]) {
    const answers = answersData.map((item) => {
      return this.answerRepository.create({
        subquestionId: item.subquestionId,
        content: (item as any).answer, // answer -> content로 매핑
        userId,
      });
    });

    // Question Id 값 null으로 변경

    return this.answerRepository.save(answers);
  }

  // 답변 업데이트 (에러 처리 추가)
  async updateAnswer(id: number, updateData: Partial<Answer>): Promise<Answer> {
    try {
      const answer = await this.answerRepository.findOne({
        where: { subquestionId: id },
      });

      if (!answer) {
        throw new NotFoundException(
          `Answer with ID ${id} not found for update.`,
        );
      }

      Object.assign(answer, updateData);
      return await this.answerRepository.save(answer);
    } catch (error) {
      // 필요에 따라 로깅을 추가할 수 있음
      throw error;
    }
  }

  // 답변 삭제
  async deleteAnswer(id: number): Promise<void> {
    // delete 메서드는 삭제된 엔티티의 개수를 반환
    const result = await this.answerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Answer with ID ${id} not found. for delete`);
    }
  }

  async getAnswersByUserOrdered(userId: number): Promise<
    {
      question: string;
      subquestions: { text: string; answer: string; date: Date; id: number }[];
    }[]
  > {
    // 1. 사용자에 해당하는 모든 answer를 조회하면서
    //    subquestion, subquestion.question 관계를 함께 로드
    const answers = await this.answerRepository.find({
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
}
