// src/authentication/oauth/apple/apple.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { ProfileProps } from '../google/dto/google.auth.type';
// Apple 전용 사용자 프로파일 타입 정의 (dto 등으로 관리)

@Injectable()
export class AppleService {
  constructor(private readonly usersService: UsersService) {}

  async handleAppleLogin(profile: ProfileProps) {
    const { email, username } = profile;

    // 이메일을 기준으로 이미 가입된 사용자 확인
    let user = await this.usersService.findByEmail(email);

    if (user) {
      if (user.oauth_provider === 'apple') {
        return user;
      } else {
        // 로컬 로그인 등 다른 방식으로 가입된 이메일인 경우 충돌 발생
        throw new ConflictException(
          '이미 다른 방식으로 등록된 이메일입니다. 다른 로그인 방식을 사용해주세요.',
        );
      }
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
