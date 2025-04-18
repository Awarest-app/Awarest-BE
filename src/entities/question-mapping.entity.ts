import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity({ name: 'question_mapping' })
export class QuestionMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_name' })
  categoryName: string; // 예: "age_range", "job", "goal"

  @Column({ name: 'category_value' })
  categoryValue: string; // 예: "20대", "학생", "다이어트"

  // 이건 뭘까요? -> 비상식량
  @Column({ nullable: true })
  depth: string; //

  @Column({ default: 1 })
  weight: number; // 중요도 (가중치)

  @Column({ name: 'question_id' })
  questionId: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
