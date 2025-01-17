// src/entities/profile.entity.ts

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'profile' })
export class Profile {
  @PrimaryColumn()
  username: string;

  @Column({ default: 0 })
  day_streak: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  answers: number;

  @Column({ default: 0 })
  achievements: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  joined_date: Date;

  // fk_profile_user: username -> users(username)
  // ManyToOne 매핑 시, users 테이블의 username이 Unique해야 합니다.
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;
}
