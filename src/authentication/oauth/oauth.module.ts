// src/authentication/oauth/oauth.module.ts
import { Module } from '@nestjs/common';
import { GoogleController } from './google/google.controller';
import { GoogleService } from './google/google.service';
import { GoogleStrategy } from './google/google.strategy';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { SurveyModule } from '@/survey/survey.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    SurveyModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [GoogleController],
  providers: [GoogleService, GoogleStrategy, JwtStrategy],
})
export class OauthModule {}
