import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { jwtRequest } from '@/type/request.interface';
import { ProfileResponseDto } from './dto/profile-response';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('noti-permission')
  async getNotiPermission(
    @Req() request: jwtRequest,
    @Body() body: { permissons: boolean },
  ) {
    const user = request.user;
    console.log('user', user);
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
}
