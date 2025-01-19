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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // .env 파일 전역 로드
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    UsersModule,
    OauthModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
