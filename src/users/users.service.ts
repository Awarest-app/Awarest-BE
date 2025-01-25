import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Answer } from '@/entities/answer.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    // 이메일로 사용자 찾기
    return this.usersRepository.findOneBy({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    // 유저 이름으로 사용자 찾기
    return this.usersRepository.findOneBy({ username });
  }

  async createOauthUser(data: {
    email: string;
    username: string;
    oauthProvider: string;
  }): Promise<User> {
    // OAuth 사용자 생성
    const newUser = this.usersRepository.create({
      email: data.email,
      username: data.username,
      isOauthUser: true,
      oauth_provider: data.oauthProvider,
    });

    return this.usersRepository.save(newUser);
  }

  // 사용자의 답변 조회 메서드
  async getUserAnswers(userId: number): Promise<Answer[]> {
    // 사용자 존재 확인
    const user = await this.findOne(userId);

    // 해당 사용자의 답변 조회
    return this.answerRepository.find({
      where: { userId },
      relations: ['subquestion', 'question'], // 필요한 관계 로드
    });
  }
}
