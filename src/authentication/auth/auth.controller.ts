// src/authentication/auth/auth.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
// import { LocalAuthGuard } from './guards/local_auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { AuthRequest, jwtRequest } from '@/type/request.interface';
import { Response } from 'express';
import { Public } from '../jwt/public.decorator';
import { adminLoginProps } from './dto/auth.dto';

class RefreshTokenDto {
  refreshToken: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  // @UseGuards(LocalAuthGuard)
  login(@Req() req) {
    return { message: 'Login successful', user: req.user };
  }

  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // 리프레시 토큰 검증
      const payload = this.authService.verifyRefreshToken(refreshToken);

      // 사용자 찾기 및 리프레시 토큰 검증
      const user = await this.usersService.findOne(payload.userId);
      if (!user || user.refresh_token !== refreshToken) {
        throw new HttpException(
          '유효하지 않은 리프레시 토큰입니다.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 새로운 액세스 토큰 생성
      const newAccessToken = this.authService.generateAccessToken(user);

      // 새로운 리프레시 토큰 생성 및 저장
      const newRefreshToken = this.authService.generateRefreshToken(user);
      await this.authService.saveRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new HttpException(
        '유효하지 않거나 만료된 리프레시 토큰입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // 로그아웃 시 리프레시 토큰 폐기
  @Post('logout')
  async logout(@Req() request: jwtRequest, @Res() res: Response) {
    try {
      console.log('logout');
      const jwtUser = request.user;

      const user = await this.usersService.findOne(jwtUser.userId);
      // 리프레시 토큰 검증
      // const payload = this.authService.verifyRefreshToken(user.refresh_token);
      // 사용자 찾기
      // const user = await this.usersService.findOne(payload.userId);
      // if (!user || user.refresh_token !== refreshToken) {
      //   throw new HttpException(
      //     '유효하지 않은 리프레시 토큰입니다.',
      //     HttpStatus.UNAUTHORIZED,
      //   );
      // }

      // 리프레시 토큰 폐기
      await this.authService.revokeRefreshToken(user.id);

      // return { message: '성공적으로 로그아웃되었습니다.' };
      // res.redirected('https://accounts.google.com/logout');
      return res.redirect('https://accounts.google.com/logout');
    } catch (error) {
      throw new HttpException(
        '유효하지 않거나 만료된 리프레시 토큰입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // 회원 탈퇴 기능 (DELETE 요청)
  @Delete('delete')
  async deleteUser(@Req() request: jwtRequest) {
    try {
      const jwtUser = request.user;
      // 리프레시 토큰 검증
      // const payload = this.authService.verifyRefreshToken(refreshToken);

      // 사용자 찾기
      const user = await this.usersService.findOne(jwtUser.userId);
      if (!user) {
        throw new HttpException(
          '유효하지 않은 리프레시 토큰입니다.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      console.log('delete user', user);
      // // 리프레시 토큰 폐기
      // await this.authService.revokeRefreshToken(user.id);

      // 사용자 삭제
      await this.usersService.deleteUser(user.id);

      return { message: '사용자가 성공적으로 삭제되었습니다.' };
    } catch (error) {
      throw new HttpException(
        '유효하지 않거나 만료된 리프레시 토큰입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * 관리자 로그인 엔드포인트
   * 클라이언트가 email과 password를 보내면,
   * DB에서 role이 admin인 사용자를 찾아 패스워드가 일치할 경우 JWT를 발급합니다.
   */
  @Post('admin/login')
  @Public()
  async adminLogin(@Body() loginData: adminLoginProps, @Res() res: Response) {
    const { email, password } = loginData;
    // 이메일로 사용자 찾기
    const user = await this.usersService.findByEmail(email);
    console.log('user');

    // 사용자 존재 여부와 role 체크
    if (!user || user.role !== 'admin') {
      throw new HttpException(
        '유효하지 않은 자격 증명입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 저장된 해시된 비밀번호와 비교 (bcrypt 사용)
    // const passwordValid = await bcrypt.compare(password, user.password);
    console.log('user.password, password', user.password, password);
    if (user.password !== password) {
      throw new HttpException(
        '유효하지 않은 비밀번호입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 액세스 토큰 및 리프레시 토큰 생성
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // DB에 리프레시 토큰 저장 (관리자도 리프레시 토큰 저장)
    await this.authService.saveRefreshToken(user.id, refreshToken);

    // 쿠키에 토큰 저장 (HttpOnly 설정으로 클라이언트 JS에서 접근 불가)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서는 HTTPS에서만 전송되도록 설정
      sameSite: 'lax',
      // maxAge: 15 * 60 * 1000, // 15분
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    // 쿠키에 토큰을 저장한 후 JSON 응답도 추가로 보낼 수 있습니다.
    return res.json({
      message: '로그인 성공',
    });
  }

  @Post('admin/logout')
  async adminLogout(@Res({ passthrough: true }) res: Response) {
    // DB 상의 리프레시 토큰 폐기 로직 등 수행

    // 클라이언트 쿠키 삭제 (빈 값과 만료 시간 설정)
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    });
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    });

    return res.json({ message: '로그아웃 성공' });
  }
}
