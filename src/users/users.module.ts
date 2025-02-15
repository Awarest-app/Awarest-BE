import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserCleanupService } from './user-cleanup.service';
import { User } from '../entities/user.entity';
import { Answer } from '@/entities/answer.entity';
import { PasswordModule } from '@/authentication/password/password.module';
import { EncryptionModule } from '@/authentication/encryption/encryption.module';
import { Profile } from '@/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Answer, Profile]),
    ScheduleModule.forRoot(),
    PasswordModule,
    EncryptionModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserCleanupService],
  exports: [UsersService, UserCleanupService],
})
export class UsersModule {}
