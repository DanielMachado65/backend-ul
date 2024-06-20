import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';

import {
  AutomateData,
  AutomateEnum,
  AutomateFunction,
  AutomateService,
} from 'src/domain/_layer/infrastructure/service/automate.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';

@Injectable()
export class N8NService implements AutomateService {
  private readonly _baseUrl: string = this._envService.get(ENV_KEYS.N8N_WEBHOOK_BASE_URL);

  private readonly _services: Map<AutomateEnum, AutomateFunction> = new Map()
    .set(AutomateEnum.REVIEW, this._sendReview.bind(this))
    .set(AutomateEnum.QUERY_DATA, this._sendQuery.bind(this))
    .set(AutomateEnum.USER_CREATED, this._sendUserCreated.bind(this))
    .set(AutomateEnum.PAYMENT, this._sendSuccessPayment.bind(this));

  constructor(private readonly _httpService: HttpService, private readonly _envService: EnvService) {}

  async dispatch(name: AutomateEnum, data: AutomateData): Promise<void> {
    const serviceFn: AutomateFunction = this._services.get(name);
    const automateData: AutomateData = { type: name, ...data };

    await serviceFn(automateData);
  }

  private async _sendReview(data: AutomateData): Promise<void> {
    const url: string = `${this._baseUrl}/efa62ea4-249f-4641-af12-766fdd374b84`;
    const request$: Observable<AxiosResponse> = this._httpService.post(url, data);

    firstValueFrom(request$);
  }

  private async _sendQuery(data: AutomateData): Promise<void> {
    const url: string = `${this._baseUrl}/efa62ea4-249f-4641-af12-766fdd374b84`;
    const request$: Observable<AxiosResponse> = this._httpService.post(url, data);

    firstValueFrom(request$);
  }

  private async _sendUserCreated(data: AutomateData): Promise<void> {
    const url: string = `${this._baseUrl}/efa62ea4-249f-4641-af12-766fdd374b84`;
    const request$: Observable<AxiosResponse> = this._httpService.post(url, data);

    firstValueFrom(request$);
  }

  private async _sendSuccessPayment(data: AutomateData): Promise<void> {
    const url: string = `${this._baseUrl}/efa62ea4-249f-4641-af12-766fdd374b84`;
    const request$: Observable<AxiosResponse> = this._httpService.post(url, data);

    firstValueFrom(request$);
  }
}
