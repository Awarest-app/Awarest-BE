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
  oauth_provider: string; // OAuth 공급자 (ex: 'google')

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
