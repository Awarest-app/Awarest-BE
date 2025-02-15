import { FirebaseService } from '@/utils/firebase/firebase.service';
import { Controller, Post, Body } from '@nestjs/common';
// import { FirebaseService } from './firebase.service';

@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly firebaseService: FirebaseService) {}

  // device token 설정
  @Post('send')
  async sendNotification(
    @Body('deviceToken') deviceToken: string,
    @Body('title') title: string,
    @Body('body') body: string,
  ) {
    console.log('deviceToken:', deviceToken);
    await this.firebaseService.sendPushNotification(deviceToken, title, body);
    return { message: '푸시 알림이 전송되었습니다!' };
  }
}
