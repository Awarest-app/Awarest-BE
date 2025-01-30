// src/entities/question.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn({ name: 'question_id' })
  questionId: number;

  @Column()
  content: string;

  // 일단 null로 처리 -> 나중에 가중치 부여
  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  depth: number;

  @Column({ nullable: true })
  xp: number;
}
