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
  exports: [QuestionMappingService],
})
export class QuestionMappingModule {}
