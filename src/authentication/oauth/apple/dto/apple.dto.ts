export type CreateUserDto = {
  provider: string;
  providerId: string;
  email: string;
  profile: AppleUserDataDto;
  accessToken: string;
  refreshToken: string;
};

export class AppleUserDataDto {
  /** Apple에서 발급한 사용자 고유 식별자 (sub) */
  sub: string;

  /** 사용자의 이메일 주소 */
  email: string;

  /** 사용자의 이름 */
  name: string;
}
