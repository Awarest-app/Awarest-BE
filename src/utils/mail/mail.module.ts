// src/subquestion/subquestion.module.ts
import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    // ConfigModule이 먼저 로드되어야 합니다.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule], // ConfigModule을 import
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com', // Apple SMTP 서버
          port: 465,
          // port: 587,
          secure: true,
          auth: {
            // ConfigService를 사용하여 환경변수 값들을 불러옵니다.
            user: configService.get<string>('APPLE_RELAY_USERNAME'),
            pass: configService.get<string>('APPLE_RELAY_PASSWORD'),
          },
        },
        defaults: {
          from: '"Awarest" <team@getawarest.com>', //// 반드시 Apple 인증 도메인 사용
        },
      }),
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
