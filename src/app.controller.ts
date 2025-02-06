import { Controller, Get, Header, Req } from '@nestjs/common';

import { Public } from './authentication/jwt/public.decorator';

@Controller()
export class AppController {
  // constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  @Public()
  @Get('test/server')
  testConnection() {
    return { message: 'NestJS 서버와 연결 성공!' };
  }

  @Get('test/jwt')
  testOauthConnection(@Req() request: any) {
    console.log('request.user', request);
    return { message: 'NestJS 서버와 연결 성공!' };
  }

  @Public()
  @Get('test-cors')
  @Header('Access-Control-Allow-Origin', 'https://adminhi.getawarest.com')
  testCors() {
    return { status: 'CORS test success' };
  }
}
