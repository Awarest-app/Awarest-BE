import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';

import { Profile } from '@/entities/profile.entity';
import { UsersModule } from '@/users/users.module';
import { User } from '@/entities/user.entity';
import { ProfileController } from './profile.controller';
import { Level } from '@/entities/level.entity';
import { ProfileXpService } from './profile-xp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User, Level]), // 필요한
    UsersModule,
  ],
  providers: [ProfileService, ProfileXpService],
  controllers: [ProfileController],
  exports: [ProfileService, ProfileXpService],
})
export class ProfileModule {}
