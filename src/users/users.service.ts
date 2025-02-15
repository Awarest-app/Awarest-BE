import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Answer } from '@/entities/answer.entity';
import { PasswordService } from '@/authentication/password/password.service';
import { EncryptionService } from '@/authentication/encryption/encryption.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    private readonly passwordService: PasswordService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private async encryptUserEmail(email: string): Promise<string> {
    return this.encryptionService.encrypt(email);
  }

  private async decryptUserEmail(encryptedEmail: string): Promise<string> {
    return this.encryptionService.decrypt(encryptedEmail);
  }

  // async createUser(data: {
  //   email: string;
  //   password: string;
  //   username?: string;
  // }): Promise<User> {
  //   const hashedPassword = await this.passwordService.hashPassword(
  //     data.password,
  //   );
  //   const encryptedEmail = await this.encryptUserEmail(data.email);
  //   const defaultUsername =
  //     data.username ||
  //     this.encryptionService.extractUsernameFromEmail(data.email);

  //   const newUser = this.usersRepository.create({
  //     email: encryptedEmail,
  //     password: hashedPassword,
  //     username: defaultUsername,
  //     role: 'user',
  //   });

  //   return this.usersRepository.save(newUser);
  // }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return Promise.all(
      users.map(async (user) => ({
        ...user,
        email: await this.decryptUserEmail(user.email),
      })),
    );
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    // if (user) {
    //   user.email = await this.decryptUserEmail(user.email);
    // }
    return user;
  }

  // email은 암호화 되어 있음
  async findByEmail(email: string): Promise<User | null> {
    // 복호화 후 이메일로 사용자 조회하기
    const user = await this.usersRepository.findOneBy({
      email,
    });
    // if (user) {
    //   user.email = email; // Return the original unencrypted email
    // }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ username });
    if (user) {
      user.email = await this.decryptUserEmail(user.email);
    }
    return user;
  }

  async createOauthUser(data: {
    email: string; // This must be already encrypted by the OAuth service
    username: string;
    oauthProvider: string;
  }): Promise<User> {
    const newUser = this.usersRepository.create({
      email: data.email, // Use the already encrypted email
      username: data.username,
      oauth_provider: data.oauthProvider,
      role: 'user',
    });

    const savedUser = await this.usersRepository.save(newUser);
    // console.log('savedUser', savedUser);

    // Decrypt email before returning
    // savedUser.email = await this.decryptUserEmail(savedUser.email);
    return savedUser;
  }

  // 사용자의 답변 조회 메서드
  async getUserAnswers(userId: number): Promise<Answer[]> {
    // 사용자 존재 확인
    const user = await this.findOne(userId);
    // console.log('user', user);

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

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await this.passwordService.hashPassword(
        updateData.password,
      );
    }

    // If email is being updated, encrypt it and update username if not provided
    if (updateData.email) {
      updateData.email = await this.encryptUserEmail(updateData.email);
      if (!updateData.username) {
        updateData.username = this.encryptionService.extractUsernameFromEmail(
          await this.decryptUserEmail(updateData.email),
        );
      }
    }

    // 업데이트할 데이터가 존재하면 할당
    Object.assign(user, updateData);

    // Save the user with encrypted email
    const savedUser = await this.usersRepository.save(user);

    // Decrypt email before returning
    savedUser.email = await this.decryptUserEmail(savedUser.email);
    return savedUser;
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
