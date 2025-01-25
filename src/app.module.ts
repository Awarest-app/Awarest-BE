// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './authentication/jwt/jwt-auth.guard';
import { QuestionModule } from './questions/question.module';
import { SubquestionModule } from './subquestion/subquestion.module';
import { QuestionMappingModule } from './questionMap/question-mapping.module';
import { AnswersModule } from './answer/answers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // .env 파일 전역 로드
    JwtModule.register({
      secret: process.env.JWT_SECRET, // -> app에서 안하면 env가 안먹힘
      global: true,
      signOptions: { expiresIn: '1d' }, // 토큰 만료 시간 등 -> TODO
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),

    UsersModule,
    // AnswersModule,
    OauthModule,
    AuthModule,
    SurveyModule,
    QuestionModule,
    SubquestionModule,
    QuestionMappingModule,
    AnswersModule,
  ],
  controllers: [AppController],
  providers: [
    // AppService,

    //jwt 전역 미들웨어 설정
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // meta data를 위한 reflector -> @public 처리
    Reflector,
  ],
  exports: [JwtModule, PassportModule],
})
export class AppModule {}
