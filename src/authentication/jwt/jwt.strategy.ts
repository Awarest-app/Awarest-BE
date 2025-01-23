// jwt.strategy.ts (기본 예시)
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // 환경변수를 사용하세요.
    });
  }

  // validate 만 자동으로 호출
  async validate(payload: any) {
    // console.log('payload', payload);
    // payload에 user 정보가 포함되어 있다고 가정(userId 등)
    // 해당 return문은 guard가 끝나고 req에 들어가짐
    return { userId: payload.userId, email: payload.email };
  }
}
