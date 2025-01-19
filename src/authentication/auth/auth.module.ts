// src/authentication/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      // secret: process.env.JWT_SECRET, // 실제로는 .env 사용 권장
      secret: 'JWT_SECRET',
      signOptions: { expiresIn: '1h' }, // 토큰 만료 시간 등
    }),
    UsersModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService], // 외부 모듈에서 AuthService를 사용할 수 있도록 내보냄
})
export class AuthModule {}
