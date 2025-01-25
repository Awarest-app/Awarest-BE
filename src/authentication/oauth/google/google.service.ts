// src/authentication/oauth/google/google.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

@Injectable()
export class GoogleService {
  constructor(private readonly usersService: UsersService) {}

  // 구글에 대한 로그인 처리
  async handleGoogleLogin(profile: any) {
    const { email, username } = profile;
    let user = await this.usersService.findByEmail(email);
    // const username_a = await this.usersService.findByUsername(username);

    // 이미 로그인한 유저인지 판별 -> MOB단에서 막음
    console.log('user', user);
    if (user && (!user.isOauthUser || !user.username)) {
      throw new Error('This email is already used for local login.');
    }

    if (!user) {
      user = await this.usersService.createOauthUser({
        email,
        username,
        oauthProvider: 'google',
      });
    }

    return user;
  }
}
