import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Survey } from '@/entities/survey.entity';
import { UserQuestion } from '@/entities/user-question.entity';

@Injectable()
export class UserQuestionService {
  constructor(
    @InjectRepository(UserQuestion)
    private readonly userQuestionRepository: Repository<UserQuestion>,
  ) {}

  // 모든 설문 데이터 조회
  async findAll(): Promise<UserQuestion[]> {
    return this.userQuestionRepository.find();
  }
}
