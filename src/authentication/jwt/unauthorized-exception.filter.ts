// // unauthorized-exception.filter.ts
// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Response } from 'express';

// // jwt passport 내부에서 토큰이 없으면 무조건 Unauthorized를 던짐 , 커스텀 해야함
// // 401이면 무조건 토큰 재로그인인가, 유저가 pw를 틀리는 경우가 존재함, 따로 에러처리
// @Catch(UnauthorizedException)
// export class UnauthorizedExceptionFilter implements ExceptionFilter {
//   catch(exception: UnauthorizedException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     // 기본적으로 UnauthorizedException의 getResponse()는 string 또는 object로 반환됩니다.
//     const exceptionResponse = exception.getResponse();
//     let message = 'Unauthorized';

//     // 만약 exceptionResponse가 객체이고 message 프로퍼티가 있다면
//     if (
//       typeof exceptionResponse === 'object' &&
//       (exceptionResponse as any).message
//     ) {
//       message = (exceptionResponse as any).message;
//     }

//     // 여기서 원하는 메시지로 재정의 (예시: 토큰이 아예 없을 때)
//     // 필요에 따라 원래 메시지를 검사해서 조건부로 변경할 수 있습니다.
//     if (message === 'Unauthorized') {
//       message = 'token expired. Please log in again.';
//     }

//     response.status(401).json({
//       statusCode: 401,
//       message,
//     });
//   }
// }
