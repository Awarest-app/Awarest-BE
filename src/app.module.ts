// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ormConfig } from './orm.config';
import { OauthModule } from './authentication/oauth/oauth.module';
import { AuthModule } from './authentication/auth/auth.module';
import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { SurveyModule } from './survey/survey.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './authentication/jwt/jwt.strategy';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './authentication/jwt/jwt-auth.guard';
import { QuestionModule } from './questions/question.module';
import { SubquestionModule } from './subquestion/subquestion.module';
import { QuestionMappingModule } from './questionMap/question-mapping.module';
import { AnswersModule } from './answer/answers.module';
import { UserQuestionModule } from './userQuestion/userQuestion.module';
import { RedisModule } from './redis/redis.module';
import { ProfileModule } from './profile/profile.module';
import { TokenRefreshInterceptor } from './authentication/jwt/token-refresh.interceptor';
import { FirebaseService } from './utils/firebase/firebase.service';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: `../config/.env.${process.env.NODE_ENV || 'development'}`, // NODE_ENV에 따라 다른 .env 파일 사용
      envFilePath: path.resolve(
        process.cwd(),
        'config',
        `.env.${process.env.NODE_ENV || 'development'}`,
      ),

      // envFilePath: process.env.ENV_FILE,
    }), // .env 파일 전역 로드
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }, // 기본 액세스 토큰 만료 시간
      }),
      global: true, // JwtModule을 전역으로 설정
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    RedisModule,

    UsersModule,
    OauthModule,
    AuthModule,
    SurveyModule,
    QuestionModule,
    SubquestionModule,
    QuestionMappingModule,
    UserQuestionModule,
    AnswersModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    JwtStrategy, // JWT 전략 등록
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // JwtAuthGuard를 전역 가드로 설정
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TokenRefreshInterceptor, // TokenRefreshInterceptor를 전역 인터셉터로 설정
    },
    // meta data를 위한 reflector -> @public 처리
    Reflector,
    // FirebaseService,
  ],
  exports: [JwtModule, PassportModule],
})
export class AppModule {}
