import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { jwtRequest } from '@/type/request.interface';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';

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
   * localTime이 utc와 차이를 반환해줌
   */
  @Post('time')
  async updateLocalTime(
    @Req() request: jwtRequest,
    // @Body() { localTime: number },
    @Body() body: { localTime: number },
  ) {
    const userId = request.user.userId;
    console.log('localTime: ', body.localTime);
    await this.usersService.updateLocalTime(userId, body.localTime);
    return { message: '시차 정보가 업데이트되었습니다.' };
  }

  /**
   * 관리자용 사용자 정보 조회 엔드포인트
   * 사용자명, 이메일, 설문 결과, 답변 날짜 목록을 반환
   */
  // @UseGuards(JwtAuthGuard)
  @Get('admin/users')
  async findAllUsers(): Promise<AdminUserResponseDto[]> {
    return this.usersService.findAllForAdmin();
  }
}
