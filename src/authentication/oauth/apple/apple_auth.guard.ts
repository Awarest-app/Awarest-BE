// src/authentication/oauth/apple/apple_auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AppleAuthGuard extends AuthGuard('apple') {
  constructor() {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('🚀 AppleAuthGuard 실행됨!');
    return (await super.canActivate(context)) as boolean;
  }
}
