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

      // 설문조사 상태 확인
      const survey = await this.surveyService.checkSurveyStatus(user.id);

      // 클라이언트로 리다이렉트하면서 토큰 전달
      res.redirect(
        `coura://login?accessToken=${accessToken}&refreshToken=${refreshToken}&survey=${survey.hasSurvey}`,
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

  // 2) 구글 OAuth 콜백
  // @Get('callback')
  // @Public() // 인증 제외
  // @UseGuards(GoogleAuthGuard)
  // async googleAuthCallback(@Req() req: AuthRequest, @Res() res: Response) {
  //   try {
  //     // 사용자 식별 및 DB 저장 후 JWT 생성
  //     console.log('req.user', req.user);
  //     const user = await this.googleService.handleGoogleLogin(req.user);

  //     // JWT 토큰 생성
  //     const token = this.authService.generateAccessToken(user);

  //     // 사용자가 설문조사를 완료했는지 확인
  //     const survey = await this.surveyService.checkSurveyStatus(user.id);
  //     // console.log('survey', survey.hasSurvey);

  //     // 클라이언트 애플리케이션으로 토큰과 설문조사 상태를 포함하여 리다이렉트
  //     res.redirect(`coura://login?token=${token}&survey=${survey.hasSurvey}`);
  //   } catch (error) {
  //     console.error('OAuth 콜백 에러:', error);

  //     // OAuth2 관련 오류인지 확인 (예: 토큰 만료)
  //     // if (error instanceof OAuth2Error) {
  //     //   // 필요에 따라 error.message 또는 error.code를 추가로 검사할 수 있습니다
  //     //   // 원하는 경우 오류 파라미터와 함께 로그인 페이지로 리다이렉트
  //     //   return res.redirect('coura://login?error=token_expired');
  //     // }

  //     // 특정 NestJS 예외 처리
  //     if (error instanceof ConflictException) {
  //       throw new HttpException(
  //         { message: error.message, code: 'CONFLICT' },
  //         HttpStatus.CONFLICT,
  //       );
  //     }

  //     // 기타 예상치 못한 오류 처리
  //     throw new HttpException(
  //       { message: '예상치 못한 오류가 발생했습니다.', code: 'UNKNOWN_ERROR' },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
