import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UpdateLocalTimeDto } from './dto/update-local-time.dto';
import { jwtRequest } from '@/type/request.interface';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  /**
   * 사용자의 현지 시간을 받아 시차(date_diff)를 계산하고 저장하는 엔드포인트
   */
  @Post('time')
  async updateLocalTime(@Req() request: jwtRequest, @Body() localTime: string) {
    const userId = request.user.userId;
    await this.usersService.updateLocalTime(userId, localTime);
    return { message: '시차 정보가 업데이트되었습니다.' };
  }
}
