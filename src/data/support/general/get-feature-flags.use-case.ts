import { Injectable } from '@nestjs/common';
import { GetFeatureFlagsDomain, GetFeatureFlagsIO } from '../../../domain/support/general/get-feature-flags.domain';
import { FeatureFlagService } from '../../../domain/_layer/infrastructure/service/feature-flag.service';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from '../../../domain/_entity/result.error';

@Injectable()
export class GetFeatureFlagsUseCase implements GetFeatureFlagsDomain {
  constructor(private readonly _featureFlagService: FeatureFlagService) {}

  getFeatureFlags(): GetFeatureFlagsIO {
    return EitherIO.of(UnknownDomainError.toFn(), this._featureFlagService.getAll());
  }
}
