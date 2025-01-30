// src/entities/answer.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subquestion } from './subquestion.entity';
import { User } from './user.entity';

@Entity({ name: 'answer' })
export class Answer {
  @PrimaryGeneratedColumn({ name: 'answers_id' })
  answersId: number;

  @Column({ name: 'subquestion_id' })
  subquestionId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  content: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @Column({ name: 'is_modified', nullable: true })
  isModified: Date;

  // fk_answer_subquestion
  @ManyToOne(() => Subquestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subquestion_id' })
  subquestion: Subquestion;

  // 어떤 사용자가 작성한 답변인지
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
