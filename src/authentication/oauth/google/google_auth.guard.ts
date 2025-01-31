// // src/authentication/oauth/google/google-auth.guard.ts
// import { ExecutionContext, Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class GoogleAuthGuard extends AuthGuard('google') {
//   constructor() {
//     super({
//       prompt: 'select_account', // ✅ 항상 계정 선택 화면 표시
//     });
//   }

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const activate = await super.canActivate(context);
//     const request = context.switchToHttp().getRequest();

//     // ✅ 추가적으로 select_account를 URL 파라미터로 강제 설정
//     request.query = {
//       ...request.query,
//       prompt: 'select_account',
//     };

//     // return activate;
//     return Boolean(result);
//   }
// }
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);
    const request = context.switchToHttp().getRequest();

    // ✅ URL 파라미터에 `prompt=select_account` 강제 적용
    request.query.prompt = 'select_account';
    request.query.access_type = 'offline'; // ✅ 리프레시 토큰 요청

    return Boolean(result);
  }
}
