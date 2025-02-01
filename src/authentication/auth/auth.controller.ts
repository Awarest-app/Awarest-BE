// src/authentication/auth/auth.controller.ts
import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
// import { LocalAuthGuard } from './guards/local_auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { jwtRequest } from '@/type/request.interface';
import { Response } from 'express';

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
}
