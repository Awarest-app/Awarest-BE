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

  // TODO -> 나중에 jwt 폴더의 services로 이동
  // 액세스 토큰 생성
  generateAccessToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '1m', // 액세스 토큰 만료 시간
    });
  }

  // 리프레시 토큰 생성
  generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '4m', // 리프레시 토큰 만료 시간
      secret: `${process.env.JWT_REFRESH_SECRET}`, // 리프레시 토큰용 별도 시크릿 사용
      // secret: 'somerefresh',
    });
  }

  // 리프레시 토큰 검증
  verifyRefreshToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: `${process.env.JWT_REFRESH_SECRET}`,
      // secret: 'somerefresh',
    });
  }

  // 리프레시 토큰 저장
  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.usersService.update(userId, { refresh_token: refreshToken });
  }

  // 리프레시 토큰 폐기
  async revokeRefreshToken(userId: number): Promise<void> {
    await this.usersService.update(userId, { refresh_token: null });
  }
}
