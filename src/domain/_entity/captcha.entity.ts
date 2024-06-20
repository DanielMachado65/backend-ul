import { IsBoolean } from 'class-validator';

export class CaptchaEntity {
  @IsBoolean()
  isValidToken: boolean;
}
