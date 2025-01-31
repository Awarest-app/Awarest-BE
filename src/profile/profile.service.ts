import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '@/entities/profile.entity';
import { ProfileResponseDto } from './dto/profile-response';
import { Level } from '@/entities/level.entity';

// src/profile/dto/profile-response.dto.ts

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Level) private levelRepository: Repository<Level>,
  ) {}

  findAll(): Promise<Profile[]> {
    return this.profileRepository.find();
  }

  async setNotification(
    userId: number,
    username: string,
    noti: boolean,
  ): Promise<void> {
    console.log('userId, username, noti', userId, username, noti);

    await this.profileRepository.upsert(
      { userId, noti, username },
      { conflictPaths: ['userId'] },
    );
  }

  /**
   * 특정 사용자의 프로필을 조회하여 필요한 필드만 반환
   * @param userId 사용자 ID
   * @returns ProfileResponseDto
   */
  async getProfileByUserId(userId: number): Promise<ProfileResponseDto> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('사용자의 프로필을 찾을 수 없습니다.');
    }

    const levelEntity = await this.levelRepository.findOne({
      where: { level: profile.level },
    });
    // profile.level을 사용하여 required_xp 조회
    let prevLevelEntity;
    if (profile.level == 1) {
      prevLevelEntity = { required_xp: 0 };
    } else {
      prevLevelEntity = await this.levelRepository.findOne({
        where: { level: profile.level - 1 },
      });
    }

    // console.log('levelEntity', levelEntity);

    if (!levelEntity) {
      throw new NotFoundException('해당 레벨의 정보를 찾을 수 없습니다.');
    }

    // DTO로 변환하여 반환
    const response: ProfileResponseDto = {
      profileImg: '',
      userName: profile.username,
      memberSince: profile.joined_date,
      dayStreak: profile.day_streak,
      totalXP: profile.total_xp,
      level: profile.level,
      levelXP: levelEntity.required_xp,
      prevXP: prevLevelEntity.required_xp,
      totalAnswers: profile.total_answers,
      lastStreakDate: profile.lastStreakDate,
      noti: profile.noti,
    };

    return response;
  }

  async updateUsername(userId: number, newUsername: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { userId } });

    if (!profile) {
      throw new NotFoundException('사용자의 프로필을 찾을 수 없습니다.');
    }

    profile.username = newUsername;
    await this.profileRepository.save(profile);
  }
}
