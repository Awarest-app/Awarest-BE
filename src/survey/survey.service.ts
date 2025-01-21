import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from '@/entities/survey.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
  ) {}

  // 설문 데이터 저장
  async saveSurveyResults(
    userId: number,
    answers: { key: string; value: string }[],
  ): Promise<Survey> {
    // 각 설문 항목을 필드에 매핑
    const surveyData: Partial<Survey> = { userId };

    for (const answer of answers) {
      switch (answer.key) {
        case 'ageRange':
          surveyData.ageRange = answer.value;
          break;
        case 'goal':
          surveyData.goal = answer.value;
          break;
        case 'job':
          surveyData.job = answer.value;
          break;
        case 'howHear':
          surveyData.howHear = answer.value;
          break;
        case 'whyInstall':
          surveyData.whyInstall = answer.value;
          break;
        default:
          console.warn(`Unknown key: ${answer.key}`);
      }
    }

    // 설문 데이터를 생성 및 저장
    const survey = this.surveyRepository.create(surveyData);
    return this.surveyRepository.save(survey);
  }

  // 모든 설문 데이터 조회
  async findAll(): Promise<Survey[]> {
    return this.surveyRepository.find();
  }

  // 특정 사용자의 설문 데이터 조회
  async findByUser(userId: number): Promise<Survey[]> {
    return this.surveyRepository.find({ where: { userId } });
  }

  // 특정 사용자의 설문 상태 확인
  async checkSurveyStatus(userId: number): Promise<{ hasSurvey: boolean }> {
    const surveyExists = await this.surveyRepository.count({
      where: { userId },
    });

    return { hasSurvey: surveyExists > 0 }; // 설문 데이터가 있으면 true, 없으면 false
  }
}
