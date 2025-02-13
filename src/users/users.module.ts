import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Answer } from '@/entities/answer.entity';
import { PasswordModule } from '@/authentication/password/password.module';
import { EncryptionModule } from '@/authentication/encryption/encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Answer]),
    PasswordModule,
    EncryptionModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
