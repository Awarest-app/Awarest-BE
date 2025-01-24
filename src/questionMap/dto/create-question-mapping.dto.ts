// src/question-mapping/dto/create-question-mapping.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateQuestionMappingDto {
  @IsString()
  categoryName: string;

  @IsString()
  categoryValue: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  questionId: number;
}
