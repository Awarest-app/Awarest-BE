import { Controller, Get } from '@nestjs/common';

import { UserQuestionService } from './userQuestion.service';

@Controller('api/userquestion')
export class UserQuestionController {
  constructor(private readonly userQuestionService: UserQuestionService) {}

  // 모든 설문 데이터 조회
  @Get('test')
  async findAll() {
    return this.userQuestionService.findAll();
  }
}
