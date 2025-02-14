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

    // console.log(
    //   'test',
    //   this.encryptionService.decrypt(
    //     '+8Whz4oIUZGrKPg9NwEJG7x442fny0gq6jZkmmjk4RDNfLGpUJbsYbJ7RCgTwrlX',
    //   ),
    // );

    const username =
      profile.username ||
      this.encryptionService.extractUsernameFromEmail(email);

    const encryptedEmail = await this.encryptionService.encrypt(email);
    // 이미 가입된 유저인지 판별

    let user = await this.usersService.findByEmail(encryptedEmail);

    if (user) {
      // 이미 등록된 이메일 유저면 동일 인물로 판단
      return user;
    }

    // user생성하면서 profile도 같이 생성해야함
    if (!user) {
      user = await this.usersService.createOauthUser({
        email: encryptedEmail,
        username,
        oauthProvider: 'google',
      });
    }

    return user;
  }
}
