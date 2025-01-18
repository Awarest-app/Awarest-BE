// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ormConfig } from './orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // .env 파일 전역 로드
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),

    UsersModule,
  ],
})
export class AppModule {}
