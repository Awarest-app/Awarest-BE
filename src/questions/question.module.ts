import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { QuestionMappingModule } from '@/questionMap/question-mapping.module';
import { Question } from '@/entities/question.entity';
import { SurveyModule } from '@/survey/survey.module';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Survey } from '@/entities/survey.entity';
import { UserQuestionModule } from '@/userQuestion/userQuestion.module';
import { UserQuestion } from '@/entities/user-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, Question, QuestionMapping, UserQuestion]), // 필요한
    QuestionMappingModule,
    UserQuestionModule,
    SurveyModule,
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
