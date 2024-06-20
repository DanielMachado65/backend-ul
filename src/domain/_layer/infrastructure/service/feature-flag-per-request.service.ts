import { FeatKey, IAppFeatures } from './feature-flag.service';

export type FeatureFlagAttributes = {
  readonly userId: string;
};

export abstract class FeatureFlagPerRequestService {
  abstract getAll(): Record<string, unknown>;
  abstract get<Key extends FeatKey, Value extends IAppFeatures[Key]>(key: Key, defaultValue: Value): Value;
  abstract isOff(key: FeatKey): boolean;
  abstract isOn(key: FeatKey): boolean;
  abstract setAttributes(featureFlagAttributes: FeatureFlagAttributes): Promise<void>;
}
