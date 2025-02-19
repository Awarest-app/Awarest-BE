import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(
          join(process.cwd(), 'config', 'firebase-adminsdk.json'),
          'utf8',
        ),
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase 초기화 완료');
    }
  }

  async sendPushNotification(deviceToken: string, title: string, body: string) {
    const message = {
      notification: {
        title,
        body,
      },
      token: deviceToken,
    };
    console.log('sendPushNotification', message);

    try {
      await admin.messaging().send(message);
      // console.log('푸시 알림 전송 성공:', response);
    } catch (error) {
      console.error('푸시 알림 전송 실패:', error);
    }
  }
}
