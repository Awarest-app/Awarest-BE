import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Strategy } from 'passport-apple';
import { AppleUserDataDto, CreateUserDto } from './dto/apple.dto';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    // console.log('AppleStrategy.name 실행');
    // console.error('AppleStrategy.name', AppleStrategy.name);

    super(
      {
        clientID: configService.get<string>('APPLE_CLIENT_ID'),
        teamID: configService.get<string>('APPLE_TEAM_ID'),
        callbackURL: configService.get<string>('APPLE_CALLBACK_URL'),
        keyID: configService.get<string>('APPLE_KEY_ID'),
        privateKeyString: configService
          .get<string>('APPLE_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),

        passReqToCallback: true,
        // scope: ['name', 'email'],
      },

      async function (req, accessToken, refreshToken, idToken, profile, cb) {
        try {
          // console.log('AppleStrategy verify callback 실행됨');
          // console.log('accessToken:', accessToken);
          // console.log('refreshToken:', refreshToken);

          const idTokenDecoded = jwtService.decode(idToken) as AppleUserDataDto;
          // console.error('idTokenDecoded:', idTokenDecoded);

          const provider = 'apple';
          const { sub: providerId, email } = idTokenDecoded;

          const userData: CreateUserDto = {
            provider,
            providerId,
            email,
            profile: idTokenDecoded,
            accessToken,
            refreshToken,
          };
          // await userService.create(userData);
          cb(null, userData);
        } catch (error) {
          console.error('AppleStrategy error:', error);
          // logger.error(error);
        }
      },
    );
  }
}
