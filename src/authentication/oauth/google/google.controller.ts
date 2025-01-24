// src/authentication/oauth/google/google.controller.ts
import {
  ConflictException,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GoogleAuthGuard } from './google_auth.guard';
import { GoogleService } from './google.service';
import { AuthService } from '@/authentication/auth/auth.service';
import { Response } from 'express';
import { AuthRequest } from '@/type/request.interface';
import { SurveyService } from '@/survey/survey.service';
import { Public } from '@/authentication/jwt/public.decorator';

@Controller('auth/google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly authService: AuthService,
    private readonly surveyService: SurveyService,
  ) {}

  // 1) 구글 OAuth 시작 (리다이렉트)
  @Get()
  @Public() // 인증 제외
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // 구글 로그인 페이지로 리다이렉트
  }

  // 2) 구글 OAuth 콜백
  @Get('callback')
  @Public() // 인증 제외
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: AuthRequest, @Res() res: Response) {
    try {
      // user 판별 및 DB 저장
      const user = await this.googleService.handleGoogleLogin(req.user);

      // JWT 발급
      const token = this.authService.generateToken(user);

      // console.log('JWT:', token);
      // survey 한 유저인지 판별
      const survey = await this.surveyService.checkSurveyStatus(user.id);
      console.log('survey', survey.hasSurvey);

      res.redirect(`coura://login?token=${token}&survey=${survey.hasSurvey}`);
    } catch (error) {
      console.error('OAuth 콜백 에러:', error);

      let errorMessage = 'An unexpected error occurred.';

      if (error instanceof ConflictException) {
        errorMessage = error.message;
      }

      // 에러 메시지를 URL 쿼리 파라미터로 전달
      res.redirect(`coura://login?error=${encodeURIComponent(errorMessage)}`);
    } finally {
      // SafariView.dismiss();
    }
  }
}
