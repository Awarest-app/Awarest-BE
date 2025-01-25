import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { JwtAuthGuard } from '@/authentication/jwt/jwt-auth.guard';
import { jwtRequest } from '@/type/request.interface';
import { UserSurvey } from '@/type/survey.type';

@Controller('api/survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // 설문 결과 저장
  @UseGuards(JwtAuthGuard)
  @Post('save-survey')
  async saveSurveyResults(
    @Req() request: jwtRequest,
    @Body() body: { answers: UserSurvey },
  ) {
    const user = request.user;
    // console.log('user', user);
    // console.log('body', body.answers);
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
