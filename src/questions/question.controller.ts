// // question.controller.ts
// import { Controller, Get, Req } from '@nestjs/common';
// import { QuestionService } from './question.service';
// import { Question } from '@/entities/question.entity';
// import { jwtRequest } from '@/type/request.interface';

// @Controller('api/questions')
// export class QuestionController {
//   constructor(private readonly questionService: QuestionService) {}

//   // @UseGuards(JwtAuthGuard)
//   @Get('/me')
//   async getMyQuestions(@Req() request: jwtRequest): Promise<Question[]> {
//     // request.user에 JwtStrategy의 validate()에서 반환한 값이 담겨 있습니다.
//     // 여기서는 { userId, username } 형태라고 가정
//     // console.log('request.user', request.user);

//     const user = request.user as { userId: number; email: string };
//     // const userId = user.userId;
//     // console.log('userId', userId);
//     return this.questionService.getQuestionsForUser(user.userId);
//   }
// }

// question.controller.ts
import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { QuestionService } from './question.service';
import { jwtRequest } from '@/type/request.interface';

@Controller('api/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // 1) 오늘의 질문 목록 가져오기
  @Get('/me')
  async getMyQuestions(@Req() request: jwtRequest) {
    const user = request.user as { userId: number; email: string };
    const questionSet = await this.questionService.getTodayQuestionsForUser(
      user.userId,
    );

    // questionSet = [{ questionId: number, answered: boolean }, ...]
    // -> 실제 Question 엔티티 정보까지 필요하다면, questionId로 DB 조회 후, answered 상태를 함께 반환
    // 간단 예시
    // (실제로는 Service 계층에서 한번에 처리해도 좋습니다)
    // 질문 ID를 기반으로 실제 질문 내용 조회
    const questionIds = questionSet.map((q) => q.questionId);
    const questions = await this.questionService.getQuestionsByIds(questionIds);

    // 응답 포맷: QuestionProps 형식으로 변환
    const response = questions.map((question) => ({
      questionId: question.questionId,
      type: question.type, // Question 엔티티에 'type' 필드가 있다고 가정
      content: question.content, // Question 엔티티에 'content' 필드가 있다고 가정
    }));

    return response;
  }

  // 2) 특정 질문에 답변 완료 -> 오늘 특정 질문에 대한 답변을 완료했음 ! (Redis에 기록하기)
  @Post('/answer')
  async answerQuestion(
    @Req() request: jwtRequest,
    @Body() body: { questionId: number },
  ) {
    const user = request.user as { userId: number; email: string };
    const { questionId } = body;

    await this.questionService.answerQuestion(user.userId, questionId);

    return { success: true };
  }
}
