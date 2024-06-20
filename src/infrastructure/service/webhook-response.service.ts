import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { WebhookService } from 'src/domain/_layer/infrastructure/service/webhook.service';

@Injectable()
export class WebhookResponseService implements WebhookService {
  constructor(private readonly _httpService: HttpService) {}

  async sendMany(urls: string[], data: unknown): Promise<void> {
    const promise: Promise<unknown>[] = urls.map((url: string) => firstValueFrom(this._httpService.post(url, data)));
    await Promise.allSettled(promise);
  }
}
