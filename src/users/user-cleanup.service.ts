import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '@/entities/user.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserCleanupService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 매일 자정에 실행되어 7일이 지난 삭제 예정 계정들을 영구 삭제
   */
  @Cron('0 0 0 * * *') // Every day at midnight
  async cleanupDeletedUsers() {
    console.log('clean');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find users marked for deletion more than 7 days ago
    const usersToDelete = await this.userRepository.find({
      where: {
        deleted_at: LessThan(sevenDaysAgo),
      },
      withDeleted: true, // Include soft-deleted records
    });

    // Permanently delete these users
    for (const user of usersToDelete) {
      await this.userRepository.delete(user.id); // This performs a hard delete
    }
  }

  /**
   * 사용자 계정을 소프트 삭제하고 7일의 유예 기간을 설정
   * @param userId 삭제할 사용자의 ID
   */
  async markUserForDeletion(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      // TypeORM's soft delete will automatically set deleted_at
      await this.userRepository.softDelete(userId);
    }
  }

  /**
   * 삭제 예정인 사용자 계정을 복구
   * @param userId 복구할 사용자의 ID
   */
  async restoreUser(userId: number): Promise<void> {
    await this.userRepository.restore(userId);
  }
}
