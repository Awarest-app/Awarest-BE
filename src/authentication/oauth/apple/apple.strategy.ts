// src/authentication/oauth/apple/apple.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      // Apple Developer Portal에서 발급받은 값들
      clientID: process.env.APPLE_CLIENT_ID, // 서비스 ID (클라이언트 ID)
      teamID: process.env.APPLE_TEAM_ID, // Apple 팀 ID
      keyID: process.env.APPLE_KEY_ID, // Key ID
      callbackURL:
        process.env.APPLE_CALLBACK_URL ||
        'http://localhost:3000/api/auth/apple/callback',
      // privateKey는 보통 여러 줄 문자열이므로, 환경변수 처리 시 개행문자 치환이 필요할 수 있음
      privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scope: ['name', 'email'],
      passReqToCallback: false, // 필요 시 요청 객체를 콜백으로 전달
    });
  }

  /**
   * Apple 로그인 후 호출되는 메서드
   * accessToken, refreshToken, idToken, profile를 기반으로 사용자 정보를 추출합니다.
   * idToken은 JWT 형식으로 사용자 이메일 등 중요한 정보가 포함되어 있습니다.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: any, // idToken은 Passport-Apple에서 이미 decode 된 객체일 수도 있음
    profile: any, // 최초 로그인 시에만 이름 정보가 포함됨
    done: VerifyCallback,
  ): Promise<any> {
    // 일반적으로 idToken에 이메일 정보가 들어있습니다.
    // 최초 로그인인 경우 profile에 name 정보가 들어올 수 있습니다.
    const email = (profile && profile.email) || idToken.email;
    let username = email.split('@')[0];

    if (profile && profile.name) {
      // profile.name는 { firstName, lastName } 형식으로 제공됨
      username =
        `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim();
    }

    const user = {
      email,
      username,
      oauth_provider: 'apple',
      // 필요 시 accessToken, refreshToken 등의 추가 정보를 저장할 수 있음
    };

    done(null, user);
  }
}
