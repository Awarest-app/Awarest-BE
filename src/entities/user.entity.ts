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

  @Column({ nullable: true })
  password: string; // 일반 로그인 시 사용

  @Column({ name: 'is_oauth_user', default: false })
  isOauthUser: boolean; // OAuth 사용자 여부

  @Column({ nullable: true })
  oauthProvider: string; // OAuth 공급자 (ex: 'google')

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // survey 에서 처리
  // @Column({ name: 'age_weight', default: 0 })
  // ageWeight: number;

  // @Column({ name: 'goal_weight', default: 0 })
  // goalWeight: number;

  // @Column({ name: 'job_weight', default: 0 })
  // jobWeight: number;
}
