export interface IQuestionProps {
  question_content: string;
  subquestion: string[];
  depth: number;
}

export class SubquestionHistoryDto {
  text: string;
  answer: string;
  date: Date;
  id: number;
}

export class QuestionHistoryDto {
  question: string;
  subquestions: SubquestionHistoryDto[];
}
