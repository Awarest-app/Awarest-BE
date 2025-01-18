// src/authentication/oauth/google/google.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

@Injectable()
export class GoogleService {
  constructor(private readonly usersService: UsersService) {}

  async handleGoogleLogin(profile: any) {
    const { email, username } = profile;
    let user = await this.usersService.findByEmail(email);

    if (user && !user.isOauthUser) {
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
