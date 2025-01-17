// src/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  country: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // 가중치 컬럼
  @Column({ name: 'age_weight', default: 0 })
  ageWeight: number;

  @Column({ name: 'goal_weight', default: 0 })
  goalWeight: number;

  @Column({ name: 'job_weight', default: 0 })
  jobWeight: number;
}
