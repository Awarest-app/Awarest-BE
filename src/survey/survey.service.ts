import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from '@/entities/survey.entity';
import { UserSurvey } from '@/type/survey.type';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
  ) {}

  // 설문 데이터 저장
  async saveSurveyResults(
    userId: number,
    answers: UserSurvey,
  ): Promise<Survey> {
    // 각 설문 항목을 필드에 매핑
    try {
      const surveyData: Partial<Survey> = { userId };

      if (answers.ageRange) {
        surveyData.ageRange = answers.ageRange;
      }

      if (answers.goal) {
        surveyData.goal = answers.goal;
      }

      if (answers.job) {
        surveyData.job = answers.job;
      }

      if (answers.how_hear) {
        surveyData.howHear = answers.how_hear;
      }

      // 설문 데이터를 생성 및 저장
      const survey = this.surveyRepository.create(surveyData);
      return await this.surveyRepository.save(survey);
    } catch (error) {
      console.error('Error in saveSurveyResults:', error);
      throw new InternalServerErrorException('Failed to save survey results');
    }
  }

  // // 모든 설문 데이터 조회
  // async findAll(): Promise<Survey[]> {
  //   return this.surveyRepository.find();
  // }

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
