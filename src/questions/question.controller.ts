// question.controller.ts
import { Controller, Get, Req } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Question } from '@/entities/question.entity';
import { jwtRequest } from '@/type/request.interface';

@Controller('api/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMyQuestions(@Req() request: jwtRequest): Promise<Question[]> {
    // request.user에 JwtStrategy의 validate()에서 반환한 값이 담겨 있습니다.
    // 여기서는 { userId, username } 형태라고 가정
    // console.log('request.user', request.user);
    const user = request.user as { userId: number; email: string };
    const userId = user.userId;
    console.log('userId', userId);
    return this.questionService.getQuestionsForUser(userId);
  }
}
