// src/authentication/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { User } from '@/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../password/password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  // TODO -> 나중에 jwt 폴더의 services로 이동
  // 액세스 토큰 생성
  generateAccessToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '30m', // 액세스 토큰 만료 시간
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
      // expiresIn: '3y', // 리프레시 토큰 만료 시간
      expiresIn: 94608000, // 3년을 초 단위로 지정
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
