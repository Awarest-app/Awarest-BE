// src/subquestion/subquestion.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subquestion } from '@/entities/subquestion.entity';
import { Repository } from 'typeorm';
import { CreateSubquestionDto } from './dto/create-subquestion.dto';
import { UpdateSubquestionDto } from './dto/update-subquestion.dto';
// import { CreateSubquestionDto, UpdateSubquestionDto } from './dto';

@Injectable()
export class SubquestionService {
  constructor(
    @InjectRepository(Subquestion)
    private readonly subqRepo: Repository<Subquestion>,
  ) {}

  async create(createDto: CreateSubquestionDto): Promise<Subquestion> {
    const subq = this.subqRepo.create(createDto);
    return this.subqRepo.save(subq);
  }

  async findAll(): Promise<Subquestion[]> {
    return this.subqRepo.find();
  }

  async findOne(id: number): Promise<Subquestion> {
    return this.subqRepo.findOne({ where: { subquestionId: id } });
  }

  async update(
    id: number,
    updateDto: UpdateSubquestionDto,
  ): Promise<Subquestion> {
    await this.subqRepo.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.subqRepo.delete(id);
  }
}
