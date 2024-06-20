import { CaptchaKind } from './captcha/captcha.guard';
import { CaptchaService } from './service/captcha.service';

/** For injection of multiple services of same contract */
export enum MultiServices {
  CAPTCHA = 'CAPTCHA',
  QUERY_POSTAL_CODE = 'QUERY_POSTAL_CODE',
}

export type CaptchaMultiServices = {
  readonly [CaptchaKind.GOOGLE_RECAPTCHA_V2]: CaptchaService<string>;
};
