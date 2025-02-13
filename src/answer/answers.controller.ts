// src/answers/answers.controller.ts

import {
  Controller,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { Answer } from '../entities/answer.entity';
// import { jwtRequest } from '@/type/request.interface';

@Controller('api/answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  // 답변 업데이트
  @Put('/update/:id')
  @HttpCode(204) // 응답 본문 없이 204 상태 코드 반환
  async updateAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Answer>,
  ) {
    this.answersService.updateAnswer(id, updateData);
  }

  // 답변 삭제
  @Delete(':id')
  async deleteAnswer(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.answersService.deleteAnswer(id);
    return { message: '답변이 삭제되었습니다.' };
  }
}
