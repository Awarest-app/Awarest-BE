// src/subquestion/subquestion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subquestion } from '@/entities/subquestion.entity';
import { Repository } from 'typeorm';
import { CreateSubquestionDto } from './dto/create-subquestion.dto';
import { UpdateSubquestionDto } from './dto/update-subquestion.dto';
import { Question } from '@/entities/question.entity';
// import { CreateSubquestionDto, UpdateSubquestionDto } from './dto';

@Injectable()
export class SubquestionService {
  constructor(
    @InjectRepository(Subquestion)
    private readonly subqRepo: Repository<Subquestion>,

    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}

  async create(createDto: CreateSubquestionDto): Promise<Subquestion> {
    const subq = this.subqRepo.create(createDto);
    return this.subqRepo.save(subq);
  }

  async findAll(): Promise<Subquestion[]> {
    return this.subqRepo.find();
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
}
