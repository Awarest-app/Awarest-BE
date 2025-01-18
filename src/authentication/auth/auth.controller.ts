// src/authentication/auth/auth.controller.ts
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local_auth.guard';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Req() req) {
    return { message: 'Login successful', user: req.user };
  }
}
