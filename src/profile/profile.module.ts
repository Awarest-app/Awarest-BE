import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';

import { Profile } from '@/entities/profile.entity';
import { UsersModule } from '@/users/users.module';
import { User } from '@/entities/user.entity';
import { ProfileController } from './profile.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User]), // 필요한
    UsersModule,
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [ProfileService],
})
export class ProfileModule {}
