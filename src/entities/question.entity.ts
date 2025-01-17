// src/entities/question.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn({ name: 'question_id' })
  questionId: number;

  @Column()
  content: string;

  @Column()
  type: string;
}
