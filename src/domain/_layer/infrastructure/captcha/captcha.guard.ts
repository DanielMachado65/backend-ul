import { ExecutionContext } from '@nestjs/common';

export enum CaptchaKind {
  GOOGLE_RECAPTCHA_V2 = 'recaptcha_v2',
}

export interface ICaptchaGuard {
  readonly isValid: (context: ExecutionContext) => Promise<boolean>;
}
