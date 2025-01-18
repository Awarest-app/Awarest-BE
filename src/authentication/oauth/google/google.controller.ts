// src/authentication/oauth/google/google.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google_auth.guard';
import { GoogleService } from './google.service';

@Controller('auth/google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get()
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Google OAuth 시작
  }

  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req, @Res() res) {
    const user = await this.googleService.handleGoogleLogin(req.user);
    // JWT 토큰 생성 후 리다이렉트
    res.redirect(`${process.env.CLIENT_REDIRECT_URL}?token=generated_token`);
  }
}
