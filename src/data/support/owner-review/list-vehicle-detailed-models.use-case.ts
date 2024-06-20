import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ListVehicleDetailedModelsDomain,
  ListVehicleDetailedModelsIO,
} from 'src/domain/support/owner-review/list-vehicle-detailed-models.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';

@Injectable()
export class ListVehicleDetailedModelsUseCase implements ListVehicleDetailedModelsDomain {
  constructor(private readonly _ownerReviewService: OwnerReviewService) {}

  listDetailedModelsByBrandModelYear(brandName: string, model: string, year: number): ListVehicleDetailedModelsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.listVehicleDetailedModels(brandName, model, year),
    );
  }
}
