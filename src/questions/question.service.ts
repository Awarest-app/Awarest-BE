import { QuestionMapping } from '@/entities/question-mapping.entity';
import { Question } from '@/entities/question.entity';
import { Subquestion } from '@/entities/subquestion.entity';
import { Survey } from '@/entities/survey.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepo: Repository<Survey>,

    @InjectRepository(QuestionMapping)
    private qmRepo: Repository<QuestionMapping>,

    @InjectRepository(Question)
    private questionRepo: Repository<Question>,

    @InjectRepository(Subquestion)
    private subqRepo: Repository<Subquestion>,
  ) {}

  async getQuestionsForUser(userId: number): Promise<Question[]> {
    // 1) 사용자 설문 정보 가져오기
    const survey = await this.surveyRepo.findOne({ where: { userId } });
    if (!survey) {
      // 설문이 없는 사용자라면 빈 배열
      return [];
    }

    // 2) (Partial) Mapping 레코드를 가져올 조건 만들기 - (OR 조건)
    //    - survey에 들어있는 항목들만 추출
    const orConditions = [];
    if (survey.ageRange) {
      orConditions.push({
        categoryName: 'age_range',
        categoryValue: survey.ageRange,
      });
    }
    if (survey.job) {
      orConditions.push({ categoryName: 'job', categoryValue: survey.job });
    }
    if (survey.goal) {
      orConditions.push({ categoryName: 'goal', categoryValue: survey.goal });
    }

    if (orConditions.length === 0) {
      return []; // 아무 항목도 없으면 반환
    }

    // 3) question_mapping에서 조건에 맞는 레코드(OR) 검색
    const mappings = await this.qmRepo.find({ where: orConditions });
    // 예: (age_range=20대, job=학생, goal=다이어트)에 해당되는 레코드가 있으면 전부 가져옴.

    // 4) questionId 별로 가중치 합산하기
    //    - 예) (20대=2, 학생=3, 다이어트=2) -> total=7
    const weightMap: Record<number, number> = {};
    for (const map of mappings) {
      if (!weightMap[map.questionId]) {
        weightMap[map.questionId] = 0;
      }
      weightMap[map.questionId] += map.weight;
    }

    // 5) 가중치가 부여된 questionId 들만 실제 Question 테이블에서 조회
    const questionIds = Object.keys(weightMap).map((idStr) =>
      parseInt(idStr, 10),
    );
    if (questionIds.length === 0) {
      return [];
    }

    const questions = await this.questionRepo.findByIds(questionIds);
    // Subquestion도 같이 로드 (예시용)
    const subquestions = await this.subqRepo.find({
      where: { questionId: In(questionIds) },
      order: { order: 'ASC' }, // 필요한 정렬 기준
    });

    // 6) Question별로 subquestions 매핑
    const subqMap = subquestions.reduce(
      (acc, sq) => {
        if (!acc[sq.questionId]) acc[sq.questionId] = [];
        acc[sq.questionId].push(sq);
        return acc;
      },
      {} as Record<number, Subquestion[]>,
    );

    questions.forEach((q) => {
      (q as any).subquestions = subqMap[q.questionId] ?? [];
    });

    // 7) 최종적으로 가중치가 높은 순으로 정렬
    questions.sort((a, b) => weightMap[b.questionId] - weightMap[a.questionId]);

    // 8) 반환
    return questions;
  }
}
