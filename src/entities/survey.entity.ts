// src/entities/survey.entity.ts

import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import {
  ageGroups,
  goalOptions,
  heardFromOptions,
  workWordsOptions,
} from '@/survey/enum/survey.enum';

@Entity({ name: 'survey' })
export class Survey {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ageGroups,
    nullable: true,
    name: 'age_range',
  })
  ageRange: (typeof ageGroups)[number]; // ageGroups 배열 내의 리터럴 타입들 중 하나

  @Column({
    type: 'enum',
    enum: goalOptions,
    nullable: true,
  })
  goal: (typeof goalOptions)[number];

  @Column({
    type: 'enum',
    enum: workWordsOptions,
    nullable: true,
  })
  job: (typeof workWordsOptions)[number];

  @Column({
    type: 'enum',
    enum: heardFromOptions,
    nullable: true,
    name: 'how_hear',
  })
  howHear: (typeof heardFromOptions)[number];

  // @Column({ name: 'age_range', nullable: true })
  // ageRange: string;

  // @Column({ nullable: true })
  // goal: string;

  // @Column({ nullable: true })
  // job: string;

  // @Column({ name: 'how_hear', nullable: true })
  // howHear: string;

  @Column({ name: 'why_install', nullable: true })
  whyInstall: string;

  // @Column({ nullable: true })
  // noti: boolean;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
