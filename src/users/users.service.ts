import { Injectable, NotFoundException } from '@nestjs/common';
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
      oauth_provider: data.oauthProvider,
      role: 'user',
    });

    return this.usersRepository.save(newUser);
  }

  // 사용자의 답변 조회 메서드
  async getUserAnswers(userId: number): Promise<Answer[]> {
    // 사용자 존재 확인
    const user = await this.findOne(userId);
    console.log('user', user);

    // 해당 사용자의 답변 조회
    return this.answerRepository.find({
      where: { userId },
      relations: ['subquestion', 'question'], // 필요한 관계 로드
    });
  }

  // 사용자 정보 업데이트 메서드
  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 업데이트할 데이터가 존재하면 할당
    Object.assign(user, updateData);

    // 업데이트된 사용자 저장
    return this.usersRepository.save(user);
  }

  async updateUsername(userId: number, newUsername: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    user.username = newUsername;
    await this.usersRepository.save(user);
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.usersRepository.delete(userId);
  }
}
