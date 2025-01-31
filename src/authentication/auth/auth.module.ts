// src/authentication/auth/auth.module.ts
import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { LocalStrategy } from './strategies/local.strategy';
import { User } from '@/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // 외부 모듈에서 AuthService를 사용할 수 있도록 내보냄
})
export class AuthModule {}
