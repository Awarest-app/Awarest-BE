// src/question-mapping/question-mapping.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionMapping } from '@/entities/question-mapping.entity';
import { QuestionMappingController } from './question-mapping.controller';
import { QuestionMappingService } from './question-mapping.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionMapping])],
  providers: [QuestionMappingService],
  controllers: [QuestionMappingController],
  exports: [QuestionMappingService], // 다른 모듈에서 사용할 수 있도록 내보냄
})
export class QuestionMappingModule {}
