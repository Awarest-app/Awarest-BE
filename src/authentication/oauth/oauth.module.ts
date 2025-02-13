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
import { AppleController } from './apple/apple.controller';
import { AppleStrategy } from './apple/apple.strategy';
import { AppleService } from './apple/apple.service';
import { JwtService } from '@nestjs/jwt';
import { EncryptionModule } from '../encryption/encryption.module';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    SurveyModule,
    EncryptionModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [GoogleController, AppleController],
  providers: [
    JwtService,
    GoogleService,
    GoogleStrategy,
    JwtStrategy,
    AppleStrategy,
    AppleService,
    EncryptionService,
  ],
})
export class OauthModule {}
