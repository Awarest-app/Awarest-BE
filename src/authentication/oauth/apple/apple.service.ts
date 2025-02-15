// src/authentication/oauth/apple/apple.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { ProfileProps } from '../google/dto/google.auth.type';
import { EncryptionService } from '../../encryption/encryption.service';

@Injectable()
export class AppleService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async handleAppleLogin(profile: ProfileProps) {
    // console.log('Callback user data: inner profile', profile);
    const { email } = profile;
    const username =
      profile.username ||
      this.encryptionService.extractUsernameFromEmail(email);

    // 이메일을 기준으로 이미 가입된 사용자 확인
    const encryptedEmail = await this.encryptionService.encrypt(email);

    let user = await this.usersService.findByEmail(encryptedEmail);

    if (user) {
      // 이미 등록된 이메일 유저면 동일 인물로 판단
      return user;
    }

    // 가입된 사용자가 없다면 OAuth 회원가입 진행
    if (!user) {
      user = await this.usersService.createOauthUser({
        email: encryptedEmail,
        username,
        oauthProvider: 'apple',
      });
      // Decrypt email before returning
      // user.email = email;
    }

    return user;
  }
}
