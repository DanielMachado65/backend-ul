import { Injectable } from '@nestjs/common';
import { CaptchaService } from 'src/domain/_layer/infrastructure/service/captcha.service';

@Injectable()
export class GoogleRecaptchaV2MockService implements CaptchaService<string> {
  validate(_token: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
