// question.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { Question } from '@/entities/question.entity';
import { JwtAuthGuard } from '@/authentication/jwt/jwt-auth.guard';
import { jwtRequest } from '@/type/request.interface';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyQuestions(@Req() request: jwtRequest): Promise<Question[]> {
    // request.user에 JwtStrategy의 validate()에서 반환한 값이 담겨 있습니다.
    // 여기서는 { userId, username } 형태라고 가정
    const user = request.user as { userId: number; email: string };
    const userId = user.userId;

    return this.questionService.getQuestionsForUser(userId);
  }
}
