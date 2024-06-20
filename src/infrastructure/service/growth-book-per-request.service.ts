import { GrowthBook, setPolyfills } from '@growthbook/growthbook';
import { Injectable, OnModuleInit, Scope } from '@nestjs/common';
import * as fetch from 'cross-fetch';
import * as crypto from 'crypto';
import * as es from 'eventsource';

import {
  FeatureFlagAttributes,
  FeatureFlagPerRequestService,
} from 'src/domain/_layer/infrastructure/service/feature-flag-per-request.service';
import { FeatKey, IAppFeatures } from 'src/domain/_layer/infrastructure/service/feature-flag.service';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';

@Injectable({ scope: Scope.REQUEST })
export class GrowthBookPerRequestService implements FeatureFlagPerRequestService, OnModuleInit {
  private readonly _gb: GrowthBook<IAppFeatures> | null;

  constructor(private readonly _envService: EnvService) {
    setPolyfills({
      fetch: fetch,
      SubtleCrypto: crypto,
      EventSource: es,
    });

    this._gb = new GrowthBook<IAppFeatures>({
      apiHost: _envService.get(ENV_KEYS.GROWTH_BOOK_API_HOST),
      clientKey: _envService.get(ENV_KEYS.GROWTH_BOOK_CLIENT_KEY),
      enableDevMode: false,
    });
  }

  async onModuleInit(): Promise<void> {
    await this._loadFeature();
  }

  async setAttributes({ userId }: FeatureFlagAttributes): Promise<void> {
    this._gb.setAttributes({ id: userId });
    await this._loadFeature();
  }

  private async _loadFeature(): Promise<void> {
    await this._gb.loadFeatures({
      skipCache: true,
    });
  }

  getAll(): Record<string, unknown> {
    return this._gb.getFeatures();
  }

  get<Key extends FeatKey, Value extends IAppFeatures[Key]>(key: Key, defaultValue: Value): Value {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._gb.getFeatureValue(key, defaultValue);
  }

  isOff(key: FeatKey): boolean {
    return this._gb.isOff(key);
  }

  isOn(key: FeatKey): boolean {
    return this._gb.isOn(key);
  }
}
