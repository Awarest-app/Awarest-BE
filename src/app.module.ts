// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Survey } from './entities/survey.entity';
import { Question } from './entities/question.entity';
import { Subquestion } from './entities/subquestion.entity';
import { Answer } from './entities/answer.entity';
import { QuestionWeight } from './entities/question-weight.entity'; // 선택
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // .env 파일 로드
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST, // 중요: docker-compose에서 db 서비스명
      port: parseInt(process.env.DB_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,

      entities: [
        User,
        Profile,
        Survey,
        Question,
        Subquestion,
        Answer,
        QuestionWeight,
      ],
      synchronize: true, // 운영 환경에선 false 권장
    }),
  ],
})
export class AppModule {}
