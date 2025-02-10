import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Strategy } from 'passport-apple';
// import { PinoLogger } from 'nestjs-pino';
// import { readFileSync } from 'fs';
import { AppleUserDataDto, CreateUserDto } from './dto/apple.dto';
// import { AppleUserDataDto } from './apple_user_data.dto';
// import { UserService } from '../../user/user.service';
// import { CreateUserDto } from '../../user/create_user.dto';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    // private readonly userService: UserService,
    // private readonly logger: PinoLogger,
  ) {
    // logger.setContext(AppleStrategy.name);
    console.log('AppleStrategy.name', AppleStrategy.name);

    super(
      {
        clientID: configService.get<string>('APPLE_CLIENT_ID'),
        teamID: configService.get<string>('APPLE_TEAM_ID'),
        callbackURL: configService.get<string>('APPLE_CALLBACK_URL'),
        keyID: configService.get<string>('APPLE_KEY_ID'),
        // privateKeyString: configService.get<string>('APPLE_PRIVATE_KEY'),
        privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        // privateKeyString: readFileSync(
        //   configService.get<string>('APPLE_KEYFILE_PATH'),
        // ),
        passReqToCallback: true,
      },
      async function (req, accessToken, refreshToken, idToken, profile, cb) {
        try {
          const idTokenDecoded = jwtService.decode(idToken) as AppleUserDataDto;
          console.log('idTokenDecoded:', idTokenDecoded);
          // logger.debug(JSON.stringify(idTokenDecoded));

          const provider = 'apple';
          const { sub: providerId, email } = idTokenDecoded;

          // const user = await userService.find(provider, providerId);
          // if (user) {
          //   return cb(null, user);
          // }

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
          console.log('AppleStrategy error:', error);
          // logger.error(error);
        }
      },
    );
  }
}
