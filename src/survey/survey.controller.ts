import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SurveyService } from './survey.service';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // 설문 결과 저장
  @Post(':userId')
  async saveSurveyResults(
    @Param('userId') userId: number,
    @Body() body: { answers: { key: string; value: string }[] },
  ) {
    const results = await this.surveyService.saveSurveyResults(
      userId,
      body.answers,
    );
    return {
      message: 'Survey results saved successfully',
      results,
    };
  }

  // 모든 설문 데이터 조회
  @Get()
  async findAll() {
    return this.surveyService.findAll();
  }

  // 특정 사용자의 설문 데이터 조회
  @Get(':userId')
  async findByUser(@Param('userId') userId: number) {
    return this.surveyService.findByUser(userId);
  }
}
