// src/authentication/oauth/google/google.controller.ts
import {
  ConflictException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
import { OAuth2Error } from 'passport-oauth2'; // OAuth2Error 임포트

@Controller('api/auth/google')
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

  @Get('callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: AuthRequest, @Res() res: Response) {
    try {
      // 사용자 로그인 처리
      const user = await this.googleService.handleGoogleLogin(req.user);

      // 액세스 토큰 및 리프레시 토큰 생성
      const accessToken = this.authService.generateAccessToken(user);
      const refreshToken = this.authService.generateRefreshToken(user);

      // 리프레시 토큰을 데이터베이스에 저장
      await this.authService.saveRefreshToken(user.id, refreshToken);

      // // 응답 헤더에 리프레시 토큰 포함
      // res.setHeader('x-refresh-token', refreshToken);

      // res.setHeader('x-access-token', accessToken);

      // 설문조사 상태 확인
      const survey = await this.surveyService.checkSurveyStatus(user.id);

      // 클라이언트로 리다이렉트하면서 토큰 전달
      res.redirect(
        `awarest://login?accessToken=${accessToken}&refreshToken=${refreshToken}&survey=${survey.hasSurvey}`,
      );
    } catch (error) {
      console.error('OAuth 콜백 에러:', error);

      if (error instanceof ConflictException) {
        throw new HttpException(
          { message: error.message, code: 'CONFLICT' },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        { message: '예상치 못한 오류가 발생했습니다.', code: 'UNKNOWN_ERROR' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
