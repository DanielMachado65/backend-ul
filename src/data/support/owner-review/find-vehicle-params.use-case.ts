import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  FindVehicleParamsDomain,
  FindVehicleParamsIO,
} from 'src/domain/support/owner-review/find-vehicle-params.domain';
import { DataNotFoundDomainError, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';

@Injectable()
export class FindVehicleParamsUseCase implements FindVehicleParamsDomain {
  constructor(private readonly _ownerReviewService: OwnerReviewService) {}

  findParamsByPlate(plate: string): FindVehicleParamsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.findVehicleParamsByPlate(plate),
    ).filter(DataNotFoundDomainError.toFn(), Boolean);
  }
}
