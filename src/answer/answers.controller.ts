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
  Req,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { Answer } from '../entities/answer.entity';
import { jwtRequest } from '@/type/request.interface';

@Controller('api/answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  // 특정 사용자의 모든 답변 조회
  @Get('me')
  async getAnswersByUser(@Req() request: jwtRequest): Promise<any> {
    const user = request.user as { userId: number; email: string };
    console.log('answer:', user);
    return this.answersService.getAnswersByUserOrdered(user.userId);
  }

  // 모든 답변 조회
  @Get()
  async getAllAnswers(): Promise<Answer[]> {
    return this.answersService.findAll();
  }

  // 특정 답변 조회
  // @Get(':id')
  // async getAnswerById(@Param('id', ParseIntPipe) id: number): Promise<Answer> {
  //   return this.answersService.findOne(id);
  // }

  // 답변 생성
  @Post()
  async createAnswer(@Body() answerData: Partial<Answer>): Promise<Answer> {
    return this.answersService.createAnswer(answerData);
  }

  // 여러 개 생성 (배열 형태) -> 대부분 이럴듯
  @Post('bulk')
  async createAnswers(
    @Req() request: jwtRequest,
    @Body() answersData: Partial<Answer>[],
  ): Promise<Answer[]> {
    const user = request.user as { userId: number; email: string };
    console.log('answersData:', answersData);
    return this.answersService.createAnswers(user.userId, answersData);
  }

  // 답변 업데이트
  @Put('/update/:id')
  async updateAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Answer>,
  ): Promise<Answer> {
    console.log('\n updateData: id ', updateData, id);
    return this.answersService.updateAnswer(id, updateData);
  }

  // 답변 삭제
  @Delete(':id')
  async deleteAnswer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.answersService.deleteAnswer(id);
  }
}
