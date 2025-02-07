// jwt.strategy.ts (기본 예시)
import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
// import { ExtractJwt } from 'passport-jwt';

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
    private readonly jwtService: JwtService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 모바일 -> header, 웹 -> cookie
      jwtFromRequest: combinedExtractor,

      // , JWT의 exp (만료 시간) 필드를 기준으로 토큰의 유효성을 검증
      // ignoreExpiration: false,
      ignoreExpiration: true,
      // secretOrKey: process.env.JWT_SECRET, // 환경변수를 사용하세요.
      secretOrKey: configService.get<string>('JWT_SECRET'), // ConfigService 사용
      passReqToCallback: true, // 요청을 validate 메서드로 전달
    });
  }

  async validate(req: Request, payload: any) {
    const now = Math.floor(Date.now() / 1000);
    // access token 만료 여부 체크
    if (payload.exp < now) {
      console.log('refreshtoken 으로 accesstoken재설정.');
      // 우선 Authorization 헤더에서 refresh token을 가져옵니다.
      let refreshToken: string | undefined = undefined;
      if (req.headers && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        // Authorization 헤더에 "Bearer <token>" 형식으로 refresh token이 있을 경우
        if (authHeader.startsWith('Bearer ')) {
          refreshToken = authHeader.slice(7).trim();
        }
      }
      // Authorization 헤더에 refresh token이 없다면 httpOnly 쿠키에서 가져옵니다.
      if (!refreshToken) {
        refreshToken = req.cookies?.refreshToken;
      }
      // refresh token이 없다면 에러 발생
      if (!refreshToken) {
        // throw new HttpException(
        //   'token expired. Please log in again.',
        //   HttpStatus.UNAUTHORIZED,
        // );
        throw new UnauthorizedException(
          'Access token expired, refresh token not provided.',
        );
      }
      try {
        const refreshSecret =
          this.configService.get<string>('JWT_REFRESH_SECRET');
        // refresh token 검증
        const decoded = this.jwtService.verify(refreshToken, {
          secret: refreshSecret,
        });

        // 토큰 내 userId가 일치하는지 확인 (추가 검증 로직 필요 시 확장 가능)
        if (decoded.userId !== payload.userId) {
          throw new UnauthorizedException('Refresh token invalid.');
        }

        // refresh token이 유효하면 새 access token을 발급 (예: 15분 유효)
        console.log('새로운 access token 발급');
        const newToken = this.jwtService.sign(
          { userId: payload.userId, email: payload.email },
          {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '15m',
          },
        );
        // 새 토큰을 요청 객체에 할당하여 인터셉터에서 응답 시 쿠키/헤더에 저장할 수 있도록 함
        (req as any).newToken = newToken;
      } catch {
        throw new UnauthorizedException('token expired. Please log in again.');
      }
    }

    // 사용자 검증 (DB 조회 등)
    const user = await this.usersService.findOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    if (user.email !== payload.email) {
      throw new UnauthorizedException(
        '토큰 이메일이 사용자 이메일과 일치하지 않습니다.',
      );
    }

    // request.user에 필요한 정보 반환
    return { userId: user.id, email: user.email, username: user.username };
  }
}
