import { GrowthBook, setPolyfills } from '@growthbook/growthbook';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import * as fetch from 'cross-fetch';
import * as crypto from 'crypto';
import * as es from 'eventsource';
import {
  AppFeatures,
  FeatKey,
  FeatureFlagService,
  IAppFeatures,
  UluruFeatureFlagReload,
} from '../../domain/_layer/infrastructure/service/feature-flag.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';

@Injectable()
export class GrowthBookService implements FeatureFlagService, OnModuleInit {
  private readonly _gb: GrowthBook<IAppFeatures> | null;
  private _cron: CronJob | null = null;
  private _refreshTime: string | null = null;

  constructor(private readonly _envService: EnvService, private readonly _schedulerRegistry: SchedulerRegistry) {
    setPolyfills({
      // Required when using built-in feature loading and Node 17 or lower
      fetch: fetch,
      // Required when using encrypted feature flags and Node 18 or lower
      SubtleCrypto: crypto,
      // Optional, can make feature rollouts faster
      EventSource: es,
      // Optional, can reduce startup times by persisting cached feature flags
      // localStorage: {
      //   // Example using Redis
      //   getItem: (key) => redisClient.get(key),
      //   setItem: (key, value) => redisClient.set(key, value),
      // },
    });

    this._gb = new GrowthBook<IAppFeatures>({
      apiHost: _envService.get(ENV_KEYS.GROWTH_BOOK_API_HOST),
      clientKey: _envService.get(ENV_KEYS.GROWTH_BOOK_CLIENT_KEY),
      enableDevMode: false,
    });
  }

  async onModuleInit(): Promise<void> {
    await this._loadFeature();
    this._refreshTime = this._getRefreshTime();

    this._cron = new CronJob(this._refreshTime, () => {
      this._loadFeature()
        .then(() => {
          const refreshTime: string = this._getRefreshTime();

          if (this._refreshTime !== refreshTime) {
            this._refreshTime = refreshTime;
            this._cron.setTime(new CronTime(this._refreshTime));
          }
        })
        .catch((_error: unknown) => null)
        .finally();
    });

    this._schedulerRegistry.addCronJob(GrowthBookService.name, this._cron);
    this._cron.start();
  }

  private async _loadFeature(): Promise<void> {
    await this._gb.loadFeatures({
      skipCache: true,
    });
  }

  private _getRefreshTime(): string {
    const { refreshTime }: UluruFeatureFlagReload = this.get(AppFeatures.uluruFeatureFlagReload, {
      refreshTime: CronExpression.EVERY_MINUTE,
    });
    return refreshTime;
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
