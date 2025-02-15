import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '@/entities/profile.entity';
import { Level } from '@/entities/level.entity';

@Injectable()
export class ProfileXpService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  /**
   * 사용자의 XP를 업데이트하고 레벨업을 처리하는 함수
   * @param userId 사용자 ID
   * @param xpToAdd 추가할 XP
   * @param answersCount 추가할 답변 수
   * @returns 업데이트된 프로필
   */
  async updateXpAndLevel(
    profile: Profile,
    xpToAdd: number,
    answersCount: number,
  ): Promise<Profile> {
    // XP 및 답변 수 업데이트
    profile.total_xp += xpToAdd;
    profile.total_answers += answersCount;

    // 레벨업 체크
    const levelUpThreshold = await this.levelRepository.findOne({
      where: { level: profile.level },
    });

    if (profile.total_xp >= levelUpThreshold.required_xp) {
      profile.level += 1;
    }

    return this.profileRepo.save(profile);
  }

  /**
   * 사용자의 연속 답변 스트릭을 업데이트하는 함수
   * @param profile 프로필 엔티티
   * @returns 업데이트된 프로필
   */
  async updateStreak(profile: Profile): Promise<Profile> {
    const today = new Date();
    const lastStreakDate = profile.lastStreakDate
      ? new Date(profile.lastStreakDate)
      : null;

    const isSameDay =
      lastStreakDate && lastStreakDate.toDateString() === today.toDateString();

    if (!isSameDay) {
      profile.day_streak += 1;
      profile.lastStreakDate = today;
      return this.profileRepo.save(profile);
    }

    return profile;
  }
}
