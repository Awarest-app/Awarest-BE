import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '@/entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
  ) {}

  findAll(): Promise<Profile[]> {
    return this.profileRepository.find();
  }

  async setNotification(userId: number, noti: boolean): Promise<void> {
    console.log('userId, noti', userId, noti);

    await this.profileRepository.upsert(
      { userId, noti },
      { conflictPaths: ['userId'] },
    );
  }
}
