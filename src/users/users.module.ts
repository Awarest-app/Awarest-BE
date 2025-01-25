import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Answer } from '@/entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Answer])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 외부 모듈에서 사용할 수 있도록 내보냄
})
export class UsersModule {}
