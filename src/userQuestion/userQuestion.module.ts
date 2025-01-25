import { UserQuestion } from '@/entities/user-question.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQuestionService } from './userQuestion.service';
import { UserQuestionController } from './userQuestion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserQuestion])],
  providers: [UserQuestionService],
  controllers: [UserQuestionController],
  exports: [UserQuestionService],
})
export class UserQuestionModule {}
