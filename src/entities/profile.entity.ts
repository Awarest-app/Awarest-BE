// src/entities/profile.entity.ts

import { Entity, PrimaryColumn, Column, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'profile' })
export class Profile {
  @PrimaryColumn()
  username: string;

  @Column({ default: 0 })
  day_streak: number;

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
  noti: string;

  // fk_profile_user: username -> users(username)
  // ManyToOne 매핑 시, users 테이블의 username이 Unique해야 합니다.
  // CASCADE: 부모 엔티티가 삭제되면 자식 엔티티도 삭제됩니다. -> User 가 사라지면 Profile도 사라짐
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;
}
