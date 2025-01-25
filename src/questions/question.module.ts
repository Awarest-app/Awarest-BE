import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { QuestionMappingModule } from '@/questionMap/question-mapping.module';
import { SubquestionModule } from '@/subquestion/subquestion.module';
import { Question } from '@/entities/question.entity';
import { SurveyModule } from '@/survey/survey.module';
import { Subquestion } from '@/entities/subquestion.entity';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Survey } from '@/entities/survey.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Question]),
    TypeOrmModule.forFeature([Survey, Question, QuestionMapping, Subquestion]), // 필요한
    QuestionMappingModule,
    SubquestionModule,
    SurveyModule,
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
