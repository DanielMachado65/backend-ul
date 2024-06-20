import { ExecutionContext } from '@nestjs/common';
import { CaptchaService } from '../../../domain/_layer/infrastructure/service/captcha.service';
import { ICaptchaGuard } from '../../../domain/_layer/infrastructure/captcha/captcha.guard';

export class GoogleRecaptchaV2Guard implements ICaptchaGuard {
  constructor(private readonly _captchaService: CaptchaService<string>) {}

  private static _getCaptchaToken(context: ExecutionContext): string | null {
    const captchaToken: string | undefined = context?.switchToHttp()?.getRequest()?.headers['x-captcha'];
    return typeof captchaToken === 'string' ? captchaToken : null;
  }

  async isValid(context: ExecutionContext): Promise<boolean> {
    const captchaToken: string | null = GoogleRecaptchaV2Guard._getCaptchaToken(context);
    return captchaToken ? this._captchaService.validate(captchaToken) : false;
  }
}
