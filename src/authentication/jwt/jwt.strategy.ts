// jwt.strategy.ts (기본 예시)
import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // , JWT의 exp (만료 시간) 필드를 기준으로 토큰의 유효성을 검증
      ignoreExpiration: false,
      // secretOrKey: process.env.JWT_SECRET, // 환경변수를 사용하세요.
      secretOrKey: configService.get<string>('JWT_SECRET'), // ConfigService 사용
      passReqToCallback: true, // 요청을 validate 메서드로 전달
    });
  }

  // validate 만 자동으로 호출
  // validate 메서드에 request 추가
  // jwt 로직을 탐 -> 무조건 DB에 정보가 있음 -> DB에 정보가 없다면 google oauth로 로그인
  async validate(req: Request, payload: any) {
    const { userId, email } = payload;
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    if (user.email !== email) {
      throw new UnauthorizedException(
        '토큰 이메일이 사용자 이메일과 일치하지 않습니다.',
      );
    }

    // if (user.email !== email) {
    //   throw new UnauthorizedException(
    //     '토큰 이메일이 사용자 이메일과 일치하지 않습니다.',
    //   );
    // }

    return { userId: user.id, email: user.email };
  }
}
