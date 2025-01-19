// src/authentication/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { User } from '@/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // jwt 유효한지 판단
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isOauthUser || user.password !== password) {
      return null;
    }
    return user;
  }

  generateToken(user: User): string {
    // 원하는 payload를 구성
    const payload = {
      sub: user.id, // 표준 클레임(sub)에 user.id를 넣는 패턴
      email: user.email, // 추가 정보
    };
    // JWT 서명
    return this.jwtService.sign(payload);
  }

  // async authSignIn(profile: { email: string; name: string }): Promise<User> {
  //   const existingUser = await this.usersService.findByEmail(profile.email);
  //   if (!existingUser) {
  //     return this.usersService.create({
  //       email: profile.email,
  //       name: profile.name,
  //       isOauthUser: true,
  //     });
  //   }
  //   return existingUser;
  // }
}
