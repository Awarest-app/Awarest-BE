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

  // TODO -> 나중에 jwt 폴더의 services로 이동할지 말ㄱ
  generateToken(user: User): string {
    // 원하는 payload를 구성
    const payload = {
      userId: user.id, // 표준 클레임(sub)에 user.id를 넣는 패턴
      email: user.email, // 추가 정보
    };
    // JWT 서명
    return this.jwtService.sign(payload);
  }
}
