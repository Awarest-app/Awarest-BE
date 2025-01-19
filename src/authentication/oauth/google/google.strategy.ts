// src/authentication/oauth/google/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

// googleAuthGuard와 결합되어 사용됨
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
    console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);

    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, displayName } = profile;
    const user = {
      email: emails[0].value,
      username: displayName,
      accessToken,
    };
    done(null, user);
  }
}
