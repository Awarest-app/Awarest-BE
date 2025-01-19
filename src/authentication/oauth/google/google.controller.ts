// src/authentication/oauth/google/google.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google_auth.guard';
import { GoogleService } from './google.service';
import { AuthService } from '@/authentication/auth/auth.service';
import { Response } from 'express';
import { AuthRequest } from '@/authentication/auth-request.interface';

@Controller('auth/google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly authService: AuthService,
  ) {}

  // 1) 구글 OAuth 시작 (리다이렉트)
  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // 구글 로그인 페이지로 리다이렉트
  }

  // 2) 구글 OAuth 콜백
  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: AuthRequest, @Res() res: Response) {
    // user 판별 및 DB 저장
    const user = await this.googleService.handleGoogleLogin(req.user);

    // DB 저장 후 JWT 발급
    const token = this.authService.generateToken(user);

    console.log('JWT:', token);
    // React Native 딥 링크로 리다이렉트 (coura://login?token=...)
    // return res.json({ token });
    // res.redirect(`coura://login/token=${token}`);

    res.redirect(`coura://login?token=${token}`);
    // res.redirect(`http://localhost:8081/login?token=${token}`);
  }
}
