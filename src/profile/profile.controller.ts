import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { jwtRequest } from '@/type/request.interface';
import { ProfileResponseDto } from './dto/profile-response';
import { UsersService } from '@/users/users.service';

@Controller('api/profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly userService: UsersService,
  ) {}

  @Post('noti-permission')
  async getNotiPermission(
    @Req() request: jwtRequest,
    @Body() body: { permissons: boolean },
  ) {
    const user = request.user;
    console.log('user premission', body.permissons);
    return this.profileService.setNotification(
      user.userId,
      user.username,
      body.permissons,
    );
  }

  @Get()
  async findAll() {
    return this.profileService.findAll();
  }

  /**
   * 현재 사용자의 프로필 정보를 조회
   * @param request 요청 객체 (JWT를 통해 사용자 정보 포함)
   * @returns ProfileResponseDto
   */
  @Get('me')
  async getProfile(@Req() request: jwtRequest): Promise<ProfileResponseDto> {
    const user = request.user as { userId: number; email: string };
    return this.profileService.getProfileByUserId(user.userId);
  }

  @Patch('username')
  async updateUsername(
    @Req() request: jwtRequest,
    @Body() body: { newUsername: string },
  ) {
    const user = request.user;
    const { newUsername } = body;

    if (!newUsername || newUsername.trim() === '') {
      throw new BadRequestException('새로운 사용자명을 입력해야 합니다.');
    }

    // User 테이블의 username 변경
    await this.userService.updateUsername(user.userId, newUsername);

    // Profile 테이블의 username 변경
    await this.profileService.updateUsername(user.userId, newUsername);

    return { message: '사용자명이 성공적으로 변경되었습니다.' };
  }

  @Post('device-token')
  async updateDeviceToken(
    @Req() request: jwtRequest,
    @Body() body: { deviceToken: string },
  ) {
    const user = request.user;
    const { deviceToken } = body;

    if (!deviceToken || deviceToken.trim() === '') {
      throw new BadRequestException('디바이스 토큰이 필요합니다.');
    }

    await this.profileService.updateDeviceToken(user.userId, deviceToken);

    return { message: '디바이스 토큰이 업데이트되었습니다.' };
  }
}
