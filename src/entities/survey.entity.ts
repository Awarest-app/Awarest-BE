// src/entities/survey.entity.ts

import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'survey' })
export class Survey {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'age_range', nullable: true })
  ageRange: string;

  @Column({ nullable: true })
  goal: string;

  @Column({ nullable: true })
  job: string;

  @Column({ name: 'how_hear', nullable: true })
  howHear: string;

  @Column({ name: 'why_install', nullable: true })
  whyInstall: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
