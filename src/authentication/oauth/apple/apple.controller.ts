// src/authentication/oauth/apple/apple.controller.ts
import {
  ConflictException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppleAuthGuard } from './apple_auth.guard';
// import { AppleService } from './apple.service';
import { AuthService } from '@/authentication/auth/auth.service';
import { Response } from 'express';
import { AuthRequest } from '@/type/request.interface';
import { SurveyService } from '@/survey/survey.service';
import { Public } from '@/authentication/jwt/public.decorator';
import { AppleService } from './apple.service';

@Controller('api/auth/apple')
export class AppleController {
  constructor(
    private readonly appleService: AppleService,
    private readonly authService: AuthService,
    private readonly surveyService: SurveyService,
  ) {}

  // 1) Apple OAuth 시작 (리다이렉트)
  @Get()
  @Public() // 인증 제외
  @UseGuards(AppleAuthGuard)
  async appleAuth() {
    console.log('Apple OAuth 시작');
    // 이 엔드포인트는 Apple 로그인 페이지로 리다이렉트됩니다.
  }

  // 2) Apple OAuth 콜백
  @Post('callback')
  @Public()
  @UseGuards(AppleAuthGuard)
  async appleAuthCallback(@Req() req: AuthRequest, @Res() res: Response) {
    try {
      // Passport가 req.user에 Apple에서 추출한 사용자 정보를 채워줍니다.
      console.log('Callback URL hit with query:', req.query); // 추가
      console.log('Callback user data:', req.user); // 추가
      const user = await this.appleService.handleAppleLogin(req.user);

      // 액세스 토큰 및 리프레시 토큰 생성
      const accessToken = this.authService.generateAccessToken(user);
      const refreshToken = this.authService.generateRefreshToken(user);

      // 리프레시 토큰을 DB 등 안전한 저장소에 저장
      await this.authService.saveRefreshToken(user.id, refreshToken);

      // (예시) 설문조사 상태 확인
      const survey = await this.surveyService.checkSurveyStatus(user.id);

      // 클라이언트(iOS 앱 등)로 리다이렉트하면서 토큰 전달
      res.redirect(
        `awarest://login?accessToken=${accessToken}&refreshToken=${refreshToken}&survey=${survey.hasSurvey}`,
      );
    } catch (error) {
      console.error('Apple OAuth 콜백 에러:', error);

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
