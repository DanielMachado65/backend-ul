import { Injectable } from '@nestjs/common';
import { CaptchaService } from 'src/domain/_layer/infrastructure/service/captcha.service';
import { HttpService } from '@nestjs/axios';
import { ENV_KEYS, EnvService } from '../../framework/env.service';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

type CheckSecurityData = {
  readonly success: boolean;
  readonly 'error-codes'?: readonly string[];
};

@Injectable()
export class GoogleRecaptchaV2Service implements CaptchaService<string> {
  private readonly _baseUrl: string;
  private readonly _secret: string;

  constructor(private readonly _httpService: HttpService, private readonly _envService: EnvService) {
    this._baseUrl = _envService.get(ENV_KEYS.GOOGLE_RECAPTCHA_V2_URL);
    this._secret = _envService.get(ENV_KEYS.GOOGLE_RECAPTCHA_V2_SECRETS);
  }

  async validate(token: string): Promise<boolean> {
    return this._checkSecurity(token);
  }

  private async _checkSecurity(token: string): Promise<boolean> {
    const response$: Observable<AxiosResponse<CheckSecurityData>> = this._httpService.post(
      this._baseUrl,
      `secret=${this._secret}&response=${token}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    const response: AxiosResponse<CheckSecurityData> = await firstValueFrom(response$);
    return typeof response.data?.success === 'boolean' ? response.data?.success : false;
  }
}
