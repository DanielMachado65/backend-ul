import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type FeatureFlags = Record<string, unknown>;

export type GetFeatureFlagsErrors = UnknownDomainError;

export type GetFeatureFlagsResult = Either<GetFeatureFlagsErrors, FeatureFlags>;

export type GetFeatureFlagsIO = EitherIO<GetFeatureFlagsErrors, FeatureFlags>;

export abstract class GetFeatureFlagsDomain {
  abstract getFeatureFlags(): GetFeatureFlagsIO;
}
