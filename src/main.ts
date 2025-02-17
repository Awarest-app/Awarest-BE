import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

import { webcrypto as nodeWebcrypto } from 'crypto';

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = nodeWebcrypto;
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  app.enableCors({
    origin: [
      'https://adminhi.getawarest.com',
      'https://beapiserver.getawarest.com',
      'awaerst://',
      'http://localhost:5173',
    ], // React Native 앱의 도메인
    // origin: '*', // 혹은 ['https://your-mobile-app-domain.com']
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    credentials: true,
    allowedHeaders: [
      'Origin',
      'Authorization',
      'Accept',
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-HTTP-Method-Override',
      'X-Forwarded-Proto',
      'X-Forwarded-For',
      'X-Forwarded-Port',
      'x-refresh-token',
      'x-access-token',
    ],
  });

  app.use(express.urlencoded({ extended: true })); // urlencoded 파싱 미들웨어 추가

  // Express 애플리케이션으로 캐스팅하여 `set` 메서드 사용 가능하게 함
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(cookieParser()); // 쿠키 파싱 미들웨어 추가
  // app.useGlobalFilters(new UnauthorizedExceptionFilter());
  await app.listen(3000, () => {
    console.log('Nest app running on port 3000');
  });
}
bootstrap();
