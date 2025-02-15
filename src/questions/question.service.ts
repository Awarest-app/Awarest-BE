import { Injectable } from '@nestjs/common';
import { DailyQuestionService } from './daily-question.service';
import { AnswerManagementService } from './answer-management.service';
import { QuestionManagementService } from './question-management.service';
import { Question } from '@/entities/question.entity';
import { Answer } from '@/entities/answer.entity';
import { IQuestionProps } from './dto/question.dto';

@Injectable()
export class QuestionService {
  constructor(
    private readonly dailyQuestionService: DailyQuestionService,
    private readonly answerManagementService: AnswerManagementService,
    private readonly questionManagementService: QuestionManagementService,
  ) {}

  /**
   * 사용자의 오늘의 질문 세트를 가져오는 함수
   */
  getTodayQuestionsForUser(userId: number) {
    return this.dailyQuestionService.getTodayQuestionsForUser(userId);
  }

  /**
   * 특정 질문에 대한 답변 완료 처리
   */
  answerQuestion(userId: number, questionId: number) {
    return this.dailyQuestionService.markQuestionAsAnswered(userId, questionId);
  }

  /**
   * 특정 ID 목록에 해당하는 질문들을 조회
   */
  getQuestionsByIds(
    userId: number,
    questionIds: number[],
  ): Promise<Question[]> {
    return this.questionManagementService.getQuestionsByIds(
      userId,
      questionIds,
    );
  }

  /**
   * 사용자의 답변 이력을 질문별로 그룹화하여 조회
   */
  getAnswersByUserOrdered(userId: number) {
    return this.answerManagementService.getAnswersByUserOrdered(userId);
  }

  /**
   * 여러 개의 답변을 생성
   */
  createAnswers(userId: number, answersData: Partial<Answer>[]) {
    return this.answerManagementService.createAnswers(userId, answersData);
  }

  /**
   * 여러 개의 답변을 제출하고 XP 계산
   */
  submitAnswers(
    userId: number,
    answersData: { subquestionId: number; answer: string }[],
    questionName: string,
  ) {
    return this.answerManagementService.submitAnswers(
      userId,
      answersData,
      questionName,
    );
  }

  /**
   * 모든 질문 목록 조회
   */
  getAllQuestions() {
    return this.questionManagementService.getAllQuestions();
  }

  /**
   * 특정 질문의 내용과 깊이를 업데이트
   */
  updateQuestion(questionId: number, content: string, depth: number) {
    return this.questionManagementService.updateQuestion(
      questionId,
      content,
      depth,
    );
  }

  /**
   * 새로운 질문 생성 - question, subquestion 모두 생성
   */
  createQuestion(content: IQuestionProps): Promise<Question> {
    const { question_content, subquestion, depth } = content;
    return this.questionManagementService.createQuestion(
      question_content,
      subquestion,
      depth,
    );
  }
}
