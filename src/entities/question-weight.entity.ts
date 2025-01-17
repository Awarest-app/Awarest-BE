// src/entities/question-weight.entity.ts

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';

@Entity({ name: 'question_weight' })
export class QuestionWeight {
  @PrimaryColumn({ name: 'question_id' })
  questionId: number;

  @PrimaryColumn({ name: 'age_range' })
  ageRange: string;

  @PrimaryColumn()
  goal: string;

  @PrimaryColumn()
  job: string;

  @Column()
  weight: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
