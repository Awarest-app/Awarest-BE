// src/question-mapping/question-mapping.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Repository } from 'typeorm';
import { CreateQuestionMappingDto } from './dto/create-question-mapping.dto';
import { UpdateQuestionMappingDto } from './dto/update-question-mapping.dto';

@Injectable()
export class QuestionMappingService {
  constructor(
    @InjectRepository(QuestionMapping)
    private readonly qmRepo: Repository<QuestionMapping>,
  ) {}

  // 설문 매핑 생성
  async create(createDto: CreateQuestionMappingDto): Promise<QuestionMapping> {
    const qm = this.qmRepo.create(createDto);
    return this.qmRepo.save(qm);
  }

  // 모든 설문 매핑 조회
  async findAll(): Promise<QuestionMapping[]> {
    return this.qmRepo.find();
  }

  // 특정 ID의 설문 매핑 조회
  async findOne(id: number): Promise<QuestionMapping> {
    return this.qmRepo.findOne({ where: { id } });
  }

  async findByQuestion(questionId: number): Promise<QuestionMapping[]> {
    return this.qmRepo.find({ where: { questionId } });
  }

  // 설문 매핑 업데이트
  async update(
    id: number,
    updateDto: UpdateQuestionMappingDto,
  ): Promise<QuestionMapping> {
    await this.qmRepo.update(id, updateDto);
    return this.findOne(id);
  }

  // 설문 매핑 삭제
  async remove(id: number): Promise<void> {
    await this.qmRepo.delete(id);
  }
}
