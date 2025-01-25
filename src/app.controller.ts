import { Controller, Get, Req } from '@nestjs/common';

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
}
