// src/subquestion/subquestion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subquestion } from '@/entities/subquestion.entity';
import { SubquestionService } from './subquestion.service';
import { SubquestionController } from './subquestion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subquestion])],
  providers: [SubquestionService],
  controllers: [SubquestionController],
  exports: [SubquestionService],
})
export class SubquestionModule {}
