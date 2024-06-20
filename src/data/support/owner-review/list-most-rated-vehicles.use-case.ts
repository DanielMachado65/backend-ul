import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ListMostRatedVehiclesDomain,
  ListMostRatedVehiclesIO,
} from 'src/domain/support/owner-review/list-most-rated-vehicles.domain';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { VehiclePreviewDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';
import { OwnerReviewService, VehiclePreview } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { BrandImage, VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';

@Injectable()
export class ListMostRatedVehiclesUseCase implements ListMostRatedVehiclesDomain {
  constructor(
    private readonly _ownerReviewService: OwnerReviewService,
    private readonly _vehicleImageService: VehicleImageService,
  ) {}

  listMostRated(): ListMostRatedVehiclesIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.listMostRatedVehicle(),
    ).flatMap((previews: ReadonlyArray<VehiclePreview>) => this._appendImages(previews));
  }

  _appendImages(previews: ReadonlyArray<VehiclePreview>): ListMostRatedVehiclesIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      Promise.all(
        previews.map(async (preview: VehiclePreview): Promise<VehiclePreviewDto> => {
          const brandImage: BrandImage = await this._vehicleImageService.getImageForBrandName(preview.brandName);
          return {
            avgTotal: preview.avgTotal,
            modelName: preview.modelName,
            reviewsCount: preview.reviewsCount,
            brandImage: brandImage.mainImageUrl,
            modelImage: null,
          };
        }),
      ),
    );
  }
}
