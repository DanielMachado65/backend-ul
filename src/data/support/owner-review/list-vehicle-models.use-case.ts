import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ListVehicleModelsDomain,
  ListVehicleModelsIO,
} from 'src/domain/support/owner-review/list-vehicle-models.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { ListVehicleModelsDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { VehicleVersionService } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';

@Injectable()
export class ListVehicleModelsUseCase implements ListVehicleModelsDomain {
  constructor(
    private readonly _ownerReviewService: OwnerReviewService,
    private readonly _vehicleVersionService: VehicleVersionService,
  ) {}

  listModelsByBrand(brandName: string): ListVehicleModelsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.listVehicleModels(brandName),
    );
  }

  listModelsByBrandV2(brandName: string): ListVehicleModelsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._vehicleVersionService.getModels(brandName),
    ).map(
      (models: ReadonlyArray<string>): ListVehicleModelsDto => ({
        brand: brandName,
        models: models.map((name: string) => ({ name })),
      }),
    );
  }
}
