import { Injectable } from '@nestjs/common';
import {
  FeatKey,
  FeatureFlagService,
  IAppFeatures,
} from '../../../domain/_layer/infrastructure/service/feature-flag.service';

@Injectable()
export class GrowthBookMockService implements FeatureFlagService {
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
}
