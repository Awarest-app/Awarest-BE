// src/entities/subquestion.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity({ name: 'subquestion' })
export class Subquestion {
  @PrimaryGeneratedColumn({ name: 'subquestion_id' })
  subquestionId: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column()
  content: string;

  @Column({ name: 'order', nullable: true })
  order: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
