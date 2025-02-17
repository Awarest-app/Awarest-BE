import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Answer } from '@/entities/answer.entity';
import { PasswordService } from '@/authentication/password/password.service';
import { EncryptionService } from '@/authentication/encryption/encryption.service';
import { Profile } from '@/entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
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
    const user = await this.usersRepository.findOne({
      where: { email },
      withDeleted: true,
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

    // Create a corresponding profile for the new user
    const newProfile = this.profileRepository.create({
      userId: savedUser.id,
      username: data.username,
    });
    await this.profileRepository.save(newProfile);

    return savedUser;
  }

  // 사용자의 답변 조회 메서드
  async getUserAnswers(userId: number): Promise<Answer[]> {
    // 사용자 존재 확인
    // const user = await this.findOne(userId);
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

  async restoreUser(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    // deleted_at을 null로 만들어 계정을 복원
    user.deleted_at = null;
    await this.usersRepository.save(user);
  }

  /**
   * 사용자의 현지 시간을 받아 서버 시간과의 차이를 계산하고 저장하는 함수
   * @param userId 사용자 ID
   * @param localTimeStr ISO 8601 형식의 현지 시간 문자열
   */
  async updateLocalTime(userId: number, localTimeStr: string): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 현재 UTC 시간
    const serverTime = new Date();
    // 클라이언트에서 보낸 현지 시간을 Date 객체로 변환
    const localTime = new Date(localTimeStr);

    // 시차 계산 (시간 단위)
    const serverHour = serverTime.getUTCHours();
    const localHour = localTime.getHours();

    // 시차 계산 (-12 ~ +14 범위 내에서)
    let dateDiff = localHour - serverHour;
    if (dateDiff > 12) {
      dateDiff -= 24;
    } else if (dateDiff < -12) {
      dateDiff += 24;
    }

    // 시차 저장
    user.date_diff = dateDiff;
    await this.usersRepository.save(user);
  }
}
