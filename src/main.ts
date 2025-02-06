import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { UnauthorizedExceptionFilter } from './authentication/jwt/unauthorized-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // 쿠키 파싱 미들웨어 추가
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:5173',
      'https://awarest-admin.pages.dev',
    ], // React Native 앱의 도메인
    // origin: '*', // 혹은 ['https://your-mobile-app-domain.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  await app.listen(3000, () => {
    console.log('Nest app running on port 3000');
  });
}
bootstrap();
