import { Injectable, Scope } from '@nestjs/common';
import {
  FeatureFlagAttributes,
  FeatureFlagPerRequestService,
} from 'src/domain/_layer/infrastructure/service/feature-flag-per-request.service';
import { FeatKey, IAppFeatures } from '../../../domain/_layer/infrastructure/service/feature-flag.service';

@Injectable({ scope: Scope.REQUEST })
export class GrowthBookPerRequestMockService implements FeatureFlagPerRequestService {
  getAll(): Record<string, unknown> {
    return undefined;
  }

  get<Key extends FeatKey, Value extends IAppFeatures[Key]>(_key: Key, _defaultValue: Value): Value {
    return undefined;
  }

  isOff(_key: FeatKey): boolean {
    return false;
  }

  isOn(_key: FeatKey): boolean {
    return false;
  }

  setAttributes(_attributes: FeatureFlagAttributes): Promise<void> {
    return Promise.resolve();
  }
}
