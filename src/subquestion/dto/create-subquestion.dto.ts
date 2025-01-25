// src/subquestion/dto/create-subquestion.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSubquestionDto {
  @IsNumber()
  questionId: number;

  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
