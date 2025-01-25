// src/answers/answers.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { Answer } from '../entities/answer.entity';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  // 모든 답변 조회
  @Get()
  async getAllAnswers(): Promise<Answer[]> {
    return this.answersService.findAll();
  }

  // 특정 답변 조회
  @Get(':id')
  async getAnswerById(@Param('id', ParseIntPipe) id: number): Promise<Answer> {
    return this.answersService.findOne(id);
  }

  // 특정 사용자의 모든 답변 조회
  @Get('user/:userId')
  async getAnswersByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Answer[]> {
    return this.answersService.findAnswersByUser(userId);
  }

  // 답변 생성
  @Post()
  async createAnswer(@Body() answerData: Partial<Answer>): Promise<Answer> {
    return this.answersService.createAnswer(answerData);
  }

  // 답변 업데이트
  @Put(':id')
  async updateAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Answer>,
  ): Promise<Answer> {
    return this.answersService.updateAnswer(id, updateData);
  }

  // 답변 삭제
  @Delete(':id')
  async deleteAnswer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.answersService.deleteAnswer(id);
  }
}
