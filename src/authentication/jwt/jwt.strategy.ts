// jwt.strategy.ts
import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

// 쿠키에서 JWT 추출
const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.accessToken || null;
};

// Authorization 헤더 + 쿠키에서 토큰을 순차적으로 확인
const combinedExtractor = (req: Request): string | null => {
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req) || cookieExtractor(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    // private readonly jwtService: JwtService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 모바일 -> header, 웹 -> cookie
      jwtFromRequest: combinedExtractor,
      secretOrKey: configService.get<string>('JWT_SECRET'), // ConfigService 사용

      // , JWT의 exp (만료 시간) 필드를 기준으로 토큰의 유효성을 검증
      ignoreExpiration: true,
      passReqToCallback: true, // 요청을 validate 메서드로 전달
    });
  }

  // access token이 만료되었을 경우, FE가 refresh endpoint를 호출하도록 UnauthorizedException을 던짐.
  async validate(req: Request, payload: any) {
    const now = Math.floor(Date.now() / 1000);

    // access token 만료 여부 체크
    if (payload.exp < now) {
      console.log('Access token expired. FE should call refresh endpoint.');
      // 여기서 unauthorized message가 결정됨
      throw new UnauthorizedException(
        'Access token expired. Please refresh token.',
      );
    }

    // 사용자 정보 조회 (DB 조회 등)
    const user = await this.usersService.findOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    // if (user.email !== payload.email) {
    //   throw new UnauthorizedException('Token email does not match user email.');
    // }
    // console.log('success');

    // request.user에 필요한 정보를 반환
    
    return { userId: user.id, email: user.email, username: user.username };
  }
}
