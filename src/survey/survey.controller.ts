import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { jwtRequest } from '@/type/request.interface';
import { UserSurvey } from '@/type/survey.type';

@Controller('api/survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // 특정 사용자의 설문 데이터 조회
  @Get('user')
  async findByUser(@Req() request: jwtRequest) {
    const user = request.user;
    console.log('private survey user :\n', user);
    return this.surveyService.checkSurveyStatus(user.userId);
  }

  // 설문 결과 저장
  @Post('save')
  async saveSurveyResults(
    @Req() request: jwtRequest,
    @Body() body: { answers: UserSurvey },
  ) {
    const user = request.user;
    console.log('survey user  : ', user);
    console.log('survey body  : ', body);
    try {
      await this.surveyService.saveSurveyResults(user.userId, body.answers);
      return {
        message: 'Survey results saved successfully',
      };
    } catch (error) {
      console.error('Error saving survey results:', error);
      throw new HttpException(
        'Failed to save survey results',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
