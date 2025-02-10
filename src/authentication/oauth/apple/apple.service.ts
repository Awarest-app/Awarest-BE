// src/authentication/oauth/apple/apple.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { ProfileProps } from '../google/dto/google.auth.type';

@Injectable()
export class AppleService {
  constructor(private readonly usersService: UsersService) {}

  async handleAppleLogin(profile: ProfileProps) {
    console.log('Callback user data: inner profile', profile);
    const { email } = profile;

    const username = email.split('@')[0];

    // 이메일을 기준으로 이미 가입된 사용자 확인
    let user = await this.usersService.findByEmail(email);

    if (user) {
      // 이미 등록된 이메일 유저면 동일 인물로 판단
      return user;

      // if (user.oauth_provider === 'apple') {
      //   return user;
      // } else {
      //   // 로컬 로그인 등 다른 방식으로 가입된 이메일인 경우 충돌 발생
      //   throw new ConflictException(
      //     '이미 다른 방식으로 등록된 이메일입니다. 다른 로그인 방식을 사용해주세요.',
      //   );
      // }
    }

    // 가입된 사용자가 없다면 OAuth 회원가입 진행
    user = await this.usersService.createOauthUser({
      email,
      username,
      oauthProvider: 'apple',
    });

    return user;
  }
}
