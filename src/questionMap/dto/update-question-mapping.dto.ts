// src/question-mapping/dto/update-question-mapping.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionMappingDto } from './create-question-mapping.dto';

export class UpdateQuestionMappingDto extends PartialType(
  CreateQuestionMappingDto,
) {}
