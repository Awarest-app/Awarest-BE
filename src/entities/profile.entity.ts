// src/entities/profile.entity.ts

import { Entity, PrimaryColumn, Column, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'profile' })
export class Profile {
  @PrimaryColumn({ name: 'user_id' })
  userId: number; // userId를 기본 키로 설정

  @Column({ default: 0 })
  day_streak: number;

  @Column({ name: 'last_streak_date', nullable: true })
  lastStreakDate: Date;

  @Column({ default: 0 })
  total_xp: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  total_answers: number;

  @Column({ default: 0 })
  achievements: number;

  @Column({ nullable: true })
  subscription: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  joined_date: Date;

  @Column({ nullable: true })
  noti: boolean;

  // fk_profile_user: username -> users(username)
  // ManyToOne 매핑 시, users 테이블의 username이 Unique해야 합니다.
  // CASCADE: 부모 엔티티가 삭제되면 자식 엔티티도 삭제됩니다. -> User 가 사라지면 Profile도 사라짐
  // @OneToOne(() => User, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  // user: User;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id', // profile 테이블에서의 FK 컬럼 명
    referencedColumnName: 'id', // User 엔티티의 PK 컬럼 명
  })
  user: User;
}
