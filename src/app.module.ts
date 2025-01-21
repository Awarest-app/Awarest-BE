// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ormConfig } from './orm.config';
import { OauthModule } from './authentication/oauth/oauth.module';
import { AuthModule } from './authentication/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // .env 파일 전역 로드
    JwtModule.register({
      secret: process.env.JWT_SECRET, // -> app에서 안하면 env가 안먹힘
      global: true,
      signOptions: { expiresIn: '1h' }, // 토큰 만료 시간 등 -> TODO
    }),
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    UsersModule,
    OauthModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
