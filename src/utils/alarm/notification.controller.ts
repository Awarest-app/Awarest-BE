import { Controller, Post, Body, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { jwtRequest } from '@/type/request.interface';

@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 디바이스 토큰을 등록/업데이트하는 엔드포인트
   * @param request JWT 요청 객체 (사용자 정보 포함)
   * @param body 디바이스 토큰 정보
   */
  @Post('send')
  async updateDeviceToken(
    @Req() request: jwtRequest,
    @Body() body: { token: string },
  ) {
    console.log('deviceToken', body.token);
    const userId = request.user.userId;
    await this.notificationService.updateDeviceToken(userId, body.token);
    return { message: '디바이스 토큰이 업데이트되었습니다.' };
  }
}
