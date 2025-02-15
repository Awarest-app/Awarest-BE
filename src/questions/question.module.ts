import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { Question } from '@/entities/question.entity';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Survey } from '@/entities/survey.entity';
import { UserQuestion } from '@/entities/user-question.entity';
import { Answer } from '@/entities/answer.entity';
import { Profile } from '@/entities/profile.entity';
import { Level } from '@/entities/level.entity';
import { RedisModule } from '@/redis/redis.module';
import { DailyQuestionService } from './daily-question.service';
import { AnswerManagementService } from './answer-management.service';
import { QuestionManagementService } from './question-management.service';
import { ProfileXpService } from '@/profile/profile-xp.service';
import { Subquestion } from '@/entities/subquestion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      QuestionMapping,
      Survey,
      UserQuestion,
      Answer,
      Profile,
      Level,
      Subquestion,
    ]),
    RedisModule,
  ],
  controllers: [QuestionController],
  providers: [
    QuestionService,
    DailyQuestionService,
    AnswerManagementService,
    QuestionManagementService,
    ProfileXpService,
  ],
  exports: [QuestionService],
})
export class QuestionModule {}
