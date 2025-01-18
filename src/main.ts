// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();
// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // 혹은 ['https://your-mobile-app-domain.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(3000, () => {
    console.log('Nest app running on port 3000');
  });
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import * as cookieParser from 'cookie-parser';
// import * as session from 'express-session';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);
//   app.use(cookieParser());
//   app.enableCors({
//     // origin: true,
//     // origin: 'http://127.0.0.1:5173',
//     origin: ['http://localhost:5173', 'http://localhost:3000'],
//     // origin: '*',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//   });

//   app.use(
//     session({
//       secret: 'my-secret',
//       resave: false,
//       saveUninitialized: false,
//     }),
//   );

//   await app.listen(3000);
// }
// bootstrap();
