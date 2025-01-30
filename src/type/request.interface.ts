// 예: src/types/auth-request.interface.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: any;
  // 또는 user: { email: string; username: string; ... } 로 구체화
}

export interface jwtRequest extends Request {
  user: { userId: number; email: string; username: string };
}
