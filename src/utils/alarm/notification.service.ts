import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from '../firebase/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      // query.where('question.id NOT IN (:...ids)', { ids: answeredQuestionIds });
      query.where('question.question_id NOT IN (:...ids)', {
        ids: answeredQuestionIds,
      });
    }
    query.orderBy('RANDOM()').take(1);

    return query.getOne();
  }

  /**
   * 매 시간마다 실행되어 각 사용자의 현지 시간이 7시나 19시인 경우 알림을 보내는 함수
   */
  // @Cron('0 * * * * *')
  @Cron('0 0 * * * *') // Every hour at minute 0
  async sendTimezoneAwareNotifications() {
    // 현재 UTC 시간 가져오기
    const now = new Date();
    const utcHour = now.getUTCHours();

    // 알림이 활성화된 모든 프로필 가져오기
    const profiles = await this.profileRepository.find({
      where: { noti: true },
      relations: ['user'], // User 엔티티와 조인
    });
    // console.log('profiles', profiles);
    for (const profile of profiles) {
      if (!profile.user?.date_diff) continue; // date_diff가 없는 사용자는 스킵

      // 사용자의 현지 시간 계산
      const userLocalHour = (utcHour + profile.user.date_diff + 24) % 24;
      console.log('userLocalHour', userLocalHour);
      console.log('username', profile.user.username);

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

  @Cron('0 0 * * * *') // Every hour at minute 0
  async checkAndResetStreaks() {
    const nowUTC = new Date();
    const utcHour = nowUTC.getUTCHours();

    const profiles = await this.profileRepository.find({
      relations: ['user'], // user 엔티티와 조인
    });

    for (const profile of profiles) {
      const userOffset = profile.user?.date_diff;
      if (userOffset === null || userOffset === undefined) continue;

      const userLocalHour = (utcHour + userOffset + 24) % 24;

      // 2. "로컬 시간 00시"인 경우에만 streak 체크
      //    즉, 로컬 시각이 자정(0시)이면 2일 경과 확인
      if (userLocalHour === 0) {
        // 3. "지금 로컬 날짜" (연-월-일만 비교하려고 0시로 세팅)
        //    => nowUTC를 기준으로 userOffset을 더한 뒤, 일/월/년 정보를 가져옴
        const localNow = new Date(nowUTC);
        // userOffset만큼 '시간'을 더해 로컬 시각으로 변환
        localNow.setHours(localNow.getUTCHours() + userOffset);

        // localNow의 시·분·초·밀리초를 0으로 맞춰, "오늘 로컬 자정"으로 설정
        localNow.setHours(0, 0, 0, 0);

        // 4. "2일 전 로컬 자정"을 계산
        const twoDaysAgoLocal = new Date(localNow);
        twoDaysAgoLocal.setDate(twoDaysAgoLocal.getDate() - 2);

        // 5. lastStreakDate(UTC 저장)와 비교
        //    - lastStreakDate를 로컬로 변환해서 비교하거나
        //    - twoDaysAgoLocal을 UTC로 역변환해서 비교
        //      (여기서는 twoDaysAgoLocal -> UTC 변환이 필요함)

        // twoDaysAgoLocal은 "로컬 날짜" 기준이므로, 다시 UTC 기준으로 돌려야 함
        // userOffset(시간)을 빼서 UTC 시각으로 환산
        const twoDaysAgoUTC = new Date(twoDaysAgoLocal);
        twoDaysAgoUTC.setHours(twoDaysAgoUTC.getUTCHours() - userOffset);

        // 이제 "로컬 시점으로 2일 전 자정"을 UTC 시각으로 만든 twoDaysAgoUTC와 비교
        if (profile.lastStreakDate && profile.lastStreakDate < twoDaysAgoUTC) {
          profile.day_streak = 0;
          await this.profileRepository.save(profile);
        }
      }
    }
  }

  // day_streak를 2틀이 지나면 0으로 초기화
  // @Cron('0 0 0 * * *') // Every day at midnight
  // @Cron('0 0 * * * *') // Every hour at minute 0
  // async checkAndResetStreaks() {
  //   const twoDaysAgo = new Date();
  //   twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  //   twoDaysAgo.setHours(0, 0, 0, 0);

  //   // Find all profiles where lastStreakDate is older than 2 days
  //   const profiles = await this.profileRepository.find({
  //     where: {
  //       lastStreakDate: LessThan(twoDaysAgo),
  //     },
  //   });

  //   // Reset day_streak to 0 for these profiles
  //   for (const profile of profiles) {
  //     profile.day_streak = 0;
  //     await this.profileRepository.save(profile);
  //   }
  // }

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
