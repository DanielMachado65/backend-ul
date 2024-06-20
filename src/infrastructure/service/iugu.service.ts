import { Injectable } from '@nestjs/common';
import { EnvService } from '../framework/env.service';
import { HttpService } from '@nestjs/axios';
import { Observable, firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  ExternalLegacyGatewaySubscription,
  LegacySubscriptionGatewayService,
} from 'src/domain/_layer/infrastructure/service/legacy-subscription-gateway.service';

@Injectable()
export class IuguService implements LegacySubscriptionGatewayService {
  private readonly _apiKey: string;
  private readonly _baseUrl: string;

  constructor(private readonly _envService: EnvService, private readonly _httpService: HttpService) {
    this._apiKey = this._envService.get('IUGU_API_KEY');
    this._baseUrl = this._envService.get('IUGU_API_BASE_URL');
  }

  async searchSubscription(externalId: string): Promise<ExternalLegacyGatewaySubscription> {
    const response$: Observable<AxiosResponse<ExternalLegacyGatewaySubscription>> =
      this._httpService.get<ExternalLegacyGatewaySubscription>(`${this._baseUrl}/subscriptions/${externalId}`, {
        validateStatus: (status: number) => status === 200,
        auth: { username: this._apiKey, password: '' },
      });
    const response: AxiosResponse<ExternalLegacyGatewaySubscription> = await firstValueFrom(response$);
    return response.data;
  }
}
