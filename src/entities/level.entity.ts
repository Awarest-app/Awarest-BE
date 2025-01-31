// src/entities/answer.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'level' })
export class Level {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  // 해당 레벨에 도달하기 위한 경험치 총량
  @Column()
  required_xp: number;
}
