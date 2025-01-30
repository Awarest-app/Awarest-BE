import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { jwtRequest } from '@/type/request.interface';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('noti-permission')
  async getNotiPermission(
    @Req() request: jwtRequest,
    @Body() body: { permissons: boolean },
  ) {
    const user = request.user;
    return this.profileService.setNotification(user.userId, body.permissons);
  }

  @Get()
  async findAll() {
    return this.profileService.findAll();
  }
}
