// src/authentication/oauth/apple/apple_auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AppleAuthGuard extends AuthGuard('apple') {
  constructor() {
    super();
  }
}
