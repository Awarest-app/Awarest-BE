import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseService } from '../firebase/firebase.service';
import { Question } from '@/entities/question.entity';
import { Profile } from '@/entities/profile.entity';
import { UserQuestion } from '@/entities/user-question.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Question, Profile, UserQuestion]),
  ],
  providers: [NotificationService, FirebaseService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
