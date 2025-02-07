import { Controller, Get, Header, Req, Res } from '@nestjs/common';

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
  testOauthConnection(@Res() res: any) {
    // console.log('request.user', request);
    // return { message: 'NestJS 서버와 연결 성공!' };
    return res.status(200).json({ message: 'update sceess' });
  }

  @Public()
  @Get('test-cors')
  @Header('Access-Control-Allow-Origin', 'https://adminhi.getawarest.com')
  testCors() {
    return { status: 'CORS test success' };
  }
}
