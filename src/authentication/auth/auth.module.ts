// src/authentication/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '@/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordModule } from '../password/password.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule, PasswordModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
