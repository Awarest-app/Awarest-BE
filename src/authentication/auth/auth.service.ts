// src/authentication/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isOauthUser || user.password !== password) {
      return null;
    }
    return user;
  }
}
