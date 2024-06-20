import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ListAllPossibleOptionsDomain,
  ListAllPossibleOptionsUseCaseIO,
  ListAllPossibleOptionsV2IO,
} from 'src/domain/support/owner-review/list-all-possible-options.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { VehicleVersionService } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';

@Injectable()
export class ListAllPossibleOptionsUseCase implements ListAllPossibleOptionsDomain {
  constructor(
    private readonly _ownerReviewService: OwnerReviewService,
    private readonly _vehicleVersionService: VehicleVersionService,
  ) {}

  listAllOptions(): ListAllPossibleOptionsUseCaseIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.listAllPossibleVehicleOptions(),
    ).catch(() => Either.right([]));
  }

  listAllOptionsV2(): ListAllPossibleOptionsV2IO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._vehicleVersionService.getAllPossibleVehicles(),
    );
  }
}
