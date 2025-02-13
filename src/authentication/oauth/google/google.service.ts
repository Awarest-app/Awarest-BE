// src/authentication/oauth/google/google.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { ProfileProps } from './dto/google.auth.type';
import { EncryptionService } from '../../encryption/encryption.service';

@Injectable()
export class GoogleService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // 구글에 대한 로그인 처리
  async handleGoogleLogin(profile: ProfileProps) {
    const { email } = profile;
    // console.log('emil', email);
    const username =
      profile.username ||
      this.encryptionService.extractUsernameFromEmail(email);

    // 이미 가입된 유저인지 판별
    let user = await this.usersService.findByEmail(email);

    if (user) {
      // 이미 등록된 이메일 유저면 동일 인물로 판단
      return user;

      // // 사용자가 이미 구글 OAuth로 가입했는지 확인
      // if (user.oauth_provider === 'google') {
      //   // 이미 구글 OAuth로 가입한 경우, 해당 유저 반환
      //   return user;
      // } else {
      //   // 로컬 로그인 계정과 OAuth 계정이 충돌하는 경우
      //   throw new ConflictException(
      //     '이미 로컬 로그인 계정으로 등록된 이메일입니다. 다른 로그인 방식을 사용해주세요.',
      //   );
      // }
    }

    // user생성하면서 profile도 같이 생성해야함
    if (!user) {
      const encryptedEmail = await this.encryptionService.encrypt(email);
      user = await this.usersService.createOauthUser({
        email: encryptedEmail,
        username,
        oauthProvider: 'google',
      });
    }

    return user;
  }
}
