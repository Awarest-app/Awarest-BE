// src/subquestion/subquestion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subquestion } from '@/entities/subquestion.entity';
import { SubquestionService } from './subquestion.service';
import { SubquestionController } from './subquestion.controller';
import { Question } from '@/entities/question.entity';
import { QuestionModule } from '@/questions/question.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subquestion, Question]), QuestionModule],
  providers: [SubquestionService],
  controllers: [SubquestionController],
  exports: [SubquestionService],
})
export class SubquestionModule {}
