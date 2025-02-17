import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from '../firebase/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { Profile } from '@/entities/profile.entity';
import { User } from '@/entities/user.entity';
import { UserQuestion } from '@/entities/user-question.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly firebaseService: FirebaseService,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserQuestion)
    private readonly userQuestionRepository: Repository<UserQuestion>,
  ) {}

  /**
   * 사용자가 답변하지 않은 랜덤 질문을 가져오는 함수
   * @param userId 사용자 ID
   * @returns 랜덤 질문 또는 null (모든 질문에 답변한 경우)
   */
  private async getRandomUnansweredQuestion(
    userId: number,
  ): Promise<Question | null> {
    // 사용자가 답변한 모든 질문 ID 가져오기
    const answeredQuestions = await this.userQuestionRepository.find({
      where: { userId },
      select: ['questionId'],
    });
    const answeredQuestionIds = answeredQuestions.map((uq) => uq.questionId);

    // 답변하지 않은 질문이 있는지 확인
    const totalQuestions = await this.questionRepository.count();
    if (answeredQuestionIds.length >= totalQuestions) {
      return null; // 모든 질문에 답변함
    }

    // 답변하지 않은 질문 중 랜덤으로 하나 선택
    const query = this.questionRepository.createQueryBuilder('question');
    if (answeredQuestionIds.length > 0) {
      query.where('question.id NOT IN (:...ids)', { ids: answeredQuestionIds });
    }
    query.orderBy('RANDOM()').take(1);

    return query.getOne();
  }

  /**
   * 매 시간마다 실행되어 각 사용자의 현지 시간이 7시나 19시인 경우 알림을 보내는 함수
   */
  // @Cron('0 * * * * *') // Every hour at minute 0
  @Cron('0 0 * * * *') // Every hour at minute 0
  async sendTimezoneAwareNotifications() {
    // 현재 UTC 시간 가져오기
    const now = new Date();
    const utcHour = now.getUTCHours();
    // console.log('utcHour', utcHour);

    // const userLocalHour = (utcHour + 9 + 24) % 24;
    // console.log('userLocalHour', userLocalHour);

    // 알림이 활성화된 모든 프로필 가져오기
    const profiles = await this.profileRepository.find({
      where: { noti: true },
      relations: ['user'], // User 엔티티와 조인
    });

    for (const profile of profiles) {
      if (!profile.user?.date_diff) continue; // date_diff가 없는 사용자는 스킵

      // 사용자의 현지 시간 계산
      const userLocalHour = (utcHour + profile.user.date_diff + 24) % 24;
      // console.log('userLocalHour', userLocalHour);

      // 사용자의 현지 시간이 7시나 19시인 경우에만 알림 전송
      if (userLocalHour === 7 || userLocalHour === 19) {
        const randomQuestion = await this.getRandomUnansweredQuestion(
          profile.userId,
        );

        // randomQuestion이 없으면 (모든 질문 완료) 해당 사용자에게 알림을 보내지 않음
        if (!randomQuestion) {
          console.log(
            `User ${profile.userId} has completed all questions. Skipping notification.`,
          );
          continue;
        }
        const message = randomQuestion.content;

        const title = 'today question';

        await this.firebaseService.sendPushNotification(
          profile.deviceToken,
          title,
          message,
        );
      }
    }
  }

  // day_streak를 2틀이 지나면 0으로 초기화
  @Cron('0 0 0 * * *') // Every day at midnight
  async checkAndResetStreaks() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    // Find all profiles where lastStreakDate is older than 2 days
    const profiles = await this.profileRepository.find({
      where: {
        lastStreakDate: LessThan(twoDaysAgo),
      },
    });

    // Reset day_streak to 0 for these profiles
    for (const profile of profiles) {
      profile.day_streak = 0;
      await this.profileRepository.save(profile);
    }
  }

  /**
   * 사용자의 디바이스 토큰을 업데이트하는 함수
   * @param userId 사용자 ID
   * @param deviceToken 새로운 디바이스 토큰
   */
  async updateDeviceToken(userId: number, deviceToken: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }

    profile.deviceToken = deviceToken;
    await this.profileRepository.save(profile);
  }
}
