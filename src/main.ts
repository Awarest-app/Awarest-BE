import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { UnauthorizedExceptionFilter } from './authentication/jwt/unauthorized-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'], // 모든 로그 레벨 활성화
  });

  app.enableCors({
    origin: [
      'https://adminhi.getawarest.com',
      'https://beapiserver.getawarest.com',
      'awaerst://',
    ], // React Native 앱의 도메인
    // origin: '*', // 혹은 ['https://your-mobile-app-domain.com']
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    credentials: true,
    // allowedHeaders: 'Content-Type, Accept, Authorization, Skip-Auth',
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
      'Skip-Auth',
    ],
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //   }),
  // );

  // app.set('trust proxy', 1);
  // Express 애플리케이션으로 캐스팅하여 `set` 메서드 사용 가능하게 함
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.use(cookieParser()); // 쿠키 파싱 미들웨어 추가
  app.useGlobalFilters(new UnauthorizedExceptionFilter());
  await app.listen(3000, () => {
    console.log('Nest app running on port 3000');
  });
}
bootstrap();
