import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ListVehicleModelYearsDomain,
  ListVehicleModelYearsIO,
} from 'src/domain/support/owner-review/list-vehicle-model-year.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { ListVehicleModelYearsDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { VehicleVersionService } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';

@Injectable()
export class ListVehicleModelYearsUseCase implements ListVehicleModelYearsDomain {
  constructor(
    private readonly _ownerReviewService: OwnerReviewService,
    private readonly _vehicleVersionService: VehicleVersionService,
  ) {}

  listModelYearByModel(brandName: string, model: string): ListVehicleModelYearsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.listVehicleModelYears(brandName, model),
    );
  }

  listModelYearByModelV2(brandName: string, model: string): ListVehicleModelYearsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._vehicleVersionService.getModelYears(brandName, model),
    ).map(
      (list: ReadonlyArray<number>): ListVehicleModelYearsDto => ({
        modelYears: list.map((year: number) => ({ year })),
      }),
    );
  }
}
