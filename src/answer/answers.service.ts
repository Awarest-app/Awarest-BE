// src/answers/answers.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../entities/answer.entity';
import { Repository } from 'typeorm';
import { Subquestion } from '../entities/subquestion.entity';
import { User } from '../entities/user.entity';
import { Question } from '../entities/question.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,

    @InjectRepository(Subquestion)
    private readonly subquestionRepository: Repository<Subquestion>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
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

  // 답변 업데이트
  async updateAnswer(id: number, updateData: Partial<Answer>): Promise<Answer> {
    const answer = await this.findOne(id);
    Object.assign(answer, updateData);
    return this.answerRepository.save(answer);
  }

  // 답변 삭제
  async deleteAnswer(id: number): Promise<void> {
    const result = await this.answerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Answer with ID ${id} not found.`);
    }
  }
}
