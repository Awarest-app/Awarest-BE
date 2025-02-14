import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from '../firebase/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Question } from '@/entities/question.entity';
import { Profile } from '@/entities/profile.entity';
import { UserQuestion } from '@/entities/user-question.entity';

@Injectable()
export class NotificationService {
  private readonly predefinedMessages = [
    '오늘의 질문이 도착했어요! 지금 확인해보세요.',
    '새로운 질문이 기다리고 있어요. 함께 생각해볼까요?',
    '오늘도 성장하는 하루 되세요! 새로운 질문이 도착했습니다.',
  ];

  constructor(
    private readonly firebaseService: FirebaseService,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(UserQuestion)
    private readonly userQuestionRepository: Repository<UserQuestion>,
  ) {}

  private getRandomMessage(): string {
    const randomIndex = Math.floor(
      Math.random() * this.predefinedMessages.length,
    );
    return this.predefinedMessages[randomIndex];
  }

  private async getRandomUnansweredQuestion(
    userId: number,
  ): Promise<Question | null> {
    // Get all questions the user has already answered
    const answeredQuestions = await this.userQuestionRepository.find({
      where: { userId },
      select: ['questionId'],
    });
    const answeredQuestionIds = answeredQuestions.map((uq) => uq.questionId);

    // Get a random unanswered question
    const query = this.questionRepository.createQueryBuilder('question');

    if (answeredQuestionIds.length > 0) {
      query.where('question.id NOT IN (:...ids)', { ids: answeredQuestionIds });
    }

    query.orderBy('RANDOM()').take(1);

    return query.getOne();
  }

  @Cron('0 0 7 * * *') // Every day at 7:00 AM
  async sendMorningNotification() {
    const profiles = await this.profileRepository.find({
      where: { noti: true }, // Only send to users who enabled notifications
    });

    for (const profile of profiles) {
      const randomQuestion = await this.getRandomUnansweredQuestion(
        profile.userId,
      );
      const message = randomQuestion
        ? randomQuestion.content
        : this.getRandomMessage();

      await this.firebaseService.sendPushNotification(
        profile.deviceToken,
        '오늘의 질문',
        message,
      );
    }
  }

  @Cron('0 0 19 * * *') // Every day at 7:00 PM
  async sendEveningNotification() {
    const profiles = await this.profileRepository.find({
      where: { noti: true }, // Only send to users who enabled notifications
    });

    for (const profile of profiles) {
      const randomQuestion = await this.getRandomUnansweredQuestion(
        profile.userId,
      );
      const message = randomQuestion
        ? randomQuestion.content
        : this.getRandomMessage();

      await this.firebaseService.sendPushNotification(
        profile.deviceToken,
        '저녁 질문',
        message,
      );
    }
  }

  @Cron('0 0 0 * * *') // Every day at mi  dnight
  // @Cron('0 * * * * *') // Every minute
  async checkAndResetStreaks() {
    const twoDaysAgo = new Date();
    console.log('twoDaysAgo:', twoDaysAgo);

    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);
    console.log('twoDaysAgo:', twoDaysAgo);

    // const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    // console.log('twoMinutesAgo:', twoMinutesAgo);

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
}
