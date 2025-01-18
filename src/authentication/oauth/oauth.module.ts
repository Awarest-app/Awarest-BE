// src/authentication/oauth/oauth.module.ts
import { Module } from '@nestjs/common';
import { GoogleController } from './google/google.controller';
import { GoogleService } from './google/google.service';
import { GoogleStrategy } from './google/google.strategy';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [GoogleController],
  providers: [GoogleService, GoogleStrategy],
})
export class OauthModule {}
