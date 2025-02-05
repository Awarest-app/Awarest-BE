// src/common/interceptors/token-refresh.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const newToken = (request as any).newToken;
        if (newToken) {
          // 헤더에 새로운 토큰 추가 (선택적)
          response.setHeader('x-refresh-token', newToken);
          // 웹 환경: 쿠키에도 저장
          response.cookie('accessToken', newToken, {
            httpOnly: true, // 클라이언트 JS에서 접근 불가
            secure: process.env.NODE_ENV === 'production', // 프로덕션에서는 HTTPS 사용 시 true
            sameSite: 'lax', // CSRF 보호
            // expires 또는 maxAge를 추가하여 쿠키 수명 지정 가능
          });
        }
      }),
    );
  }
}
