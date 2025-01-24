// src/subquestion/dto/update-subquestion.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubquestionDto } from './create-subquestion.dto';

export class UpdateSubquestionDto extends PartialType(CreateSubquestionDto) {}
