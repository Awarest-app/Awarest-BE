import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from '@/entities/survey.entity';
import { UserSurvey } from './dto/survey.dto';
import {
  ageGroups,
  goalOptions,
  heardFromOptions,
  workWordsOptions,
} from './enum/survey.enum';

// 헬퍼 함수: 값이 존재하고, 옵션 배열에 포함되어 있으면 해당 필드를 반환합니다.
function assignIfValid<T extends readonly string[]>(
  value: string | undefined,
  key: keyof Survey,
  options: T,
): Partial<Survey> {
  return value && (options as readonly string[]).includes(value)
    ? { [key]: value as T[number] }
    : {};
}

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
      // 조건부 객체 스프레드를 사용하여 값이 있는 경우에만 해당 속성을 추가합니다.
      const surveyData: Partial<Survey> = {
        userId,
        ...assignIfValid(answers.ageRange, 'ageRange', ageGroups),
        ...assignIfValid(answers.goal, 'goal', goalOptions),
        ...assignIfValid(answers.job, 'job', workWordsOptions),
        ...assignIfValid(answers.how_hear, 'howHear', heardFromOptions),
      };
      // 설문 데이터를 생성 및 저장
      const survey = this.surveyRepository.create(surveyData);
      return await this.surveyRepository.save(survey);
    } catch (error) {
      console.error('Error in saveSurveyResults:', error);
      throw new InternalServerErrorException('Failed to save survey results');
    }
  }

  // 특정 사용자의 설문 상태 확인 -> 에러처리를 굳이?,
  async checkSurveyStatus(userId: number): Promise<{ hasSurvey: boolean }> {
    const surveyExists = await this.surveyRepository.count({
      where: { userId },
    });

    return { hasSurvey: surveyExists > 0 }; // 설문 데이터가 있으면 true, 없으면 false
  }
}
