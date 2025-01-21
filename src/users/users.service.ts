import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
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
      oauthProvider: data.oauthProvider,
    });

    return this.usersRepository.save(newUser);
  }
}
