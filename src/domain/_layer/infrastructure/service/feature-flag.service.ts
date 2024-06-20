import { CamelCase } from '../../../../infrastructure/util/string.util';

export type UluruRoutesThrottlePathFlag = {
  readonly limit: number;
  readonly ttl: number;
  readonly skip: boolean;
};

export type UluruRoutesThrottleFlag = {
  readonly fallback: UluruRoutesThrottlePathFlag;
  readonly paths: ReadonlyArray<{ readonly path: string } & UluruRoutesThrottlePathFlag>;
};

export type UluruFeatureFlagReload = {
  readonly refreshTime: string;
};

export type RoutePolicies =
  | boolean
  | {
      readonly [key: string]: RoutePolicies;
    };

export type RouteRules = {
  readonly target: string;
  readonly actor: string;
  readonly method: string;
  readonly containsPath: string;
  readonly includeQueryParams: RoutePolicies;
  readonly includeReqBody: RoutePolicies;
  readonly includeResBody: RoutePolicies;
};

export type WhitelistedRoutes = ReadonlyArray<RouteRules>;

export type UluruHttpLogRules = {
  readonly whitelistedRoutes: WhitelistedRoutes;
};

export type UluruTraceRulePolicy = {
  input: ReadonlyArray<unknown> | boolean;
  output: unknown | boolean;
};

export type UluruTraceRule = { enable: boolean } & { [key: string]: UluruTraceRulePolicy | boolean };

export type UluruTraceRules = Record<string, UluruTraceRule>;

export interface IAppFeatures {
  readonly 'checkout-v2-analytics': boolean;
  readonly 'payment-v2': boolean;
  readonly 'query-v2': boolean;
  readonly 'tailwind-header': boolean;
  readonly 'test-drive-v2': boolean;
  readonly 'uluru-auto-reprocess-query': boolean;
  readonly 'uluru-feature-flag-reload': UluruFeatureFlagReload;
  readonly 'uluru-http-log-rules': UluruHttpLogRules;
  readonly 'uluru-query-score': boolean;
  readonly 'uluru-routes-throttle': UluruRoutesThrottleFlag;
  readonly 'uluru-routes': boolean;
  readonly 'uluru-sign-up-sign-in': boolean;
  readonly 'uluru-trace-rules': UluruTraceRules;
  readonly notification: boolean;
}

export type FeatKey = string & keyof IAppFeatures;

export type Features = Record<CamelCase<FeatKey>, FeatKey>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AppFeatures: Features = {
  checkoutV2Analytics: 'checkout-v2-analytics',
  notification: 'notification',
  paymentV2: 'payment-v2',
  queryV2: 'query-v2',
  tailwindHeader: 'tailwind-header',
  testDriveV2: 'test-drive-v2',
  uluruAutoReprocessQuery: 'uluru-auto-reprocess-query',
  uluruFeatureFlagReload: 'uluru-feature-flag-reload',
  uluruHttpLogRules: 'uluru-http-log-rules',
  uluruQueryScore: 'uluru-query-score',
  uluruRoutes: 'uluru-routes',
  uluruRoutesThrottle: 'uluru-routes-throttle',
  uluruSignUpSignIn: 'uluru-sign-up-sign-in',
  uluruTraceRules: 'uluru-trace-rules',
};

export abstract class FeatureFlagService {
  abstract getAll(): Record<string, unknown>;

  abstract get<Key extends FeatKey, Value extends IAppFeatures[Key]>(key: Key, defaultValue: Value): Value;

  abstract isOff(key: FeatKey): boolean;

  abstract isOn(key: FeatKey): boolean;
}
