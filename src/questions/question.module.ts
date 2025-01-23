import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from '@/entities/survey.entity';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Survey])],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
