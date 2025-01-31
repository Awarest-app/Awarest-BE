// src/entities/answer.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'level' })
export class Level {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column()
  required_xp: number;
}
