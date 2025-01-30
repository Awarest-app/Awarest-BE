// src/profile/dto/create-profile.dto.ts

import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProfileDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  day_streak: number;

  @IsNumber()
  total_xp: number;

  @IsNumber()
  level: number;

  @IsNumber()
  total_answers: number;

  @IsNumber()
  achievements: number;

  @IsOptional()
  @IsString()
  subscription?: string;

  @IsOptional()
  @IsString()
  noti?: string;
}
