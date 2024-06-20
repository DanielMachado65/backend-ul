import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ListVehicleBrandsDomain,
  ListVehicleBrandsIO,
} from 'src/domain/support/owner-review/list-vehicle-brands.domain';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewService, VehicleBrandsList } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { BrandImage, VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';
import { VehicleVersionService } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';

@Injectable()
export class ListVehicleBrandsUseCase implements ListVehicleBrandsDomain {
  constructor(
    private readonly _ownerReviewService: OwnerReviewService,
    private readonly _vehicleImageService: VehicleImageService,
    private readonly _vehicleVersionService: VehicleVersionService,
  ) {}

  listBrands(): ListVehicleBrandsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.listVehicleBrands(),
    ).flatMap((list: VehicleBrandsList) => this._brandsToName(list.brands));
  }

  listBrandsV2(): ListVehicleBrandsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => this._vehicleVersionService.getBrands()).flatMap(
      (list: ReadonlyArray<string>) =>
        this._brandsToName(
          list.map((name: string) => ({
            name,
          })),
        ),
    );
  }

  private _brandsToName(brandnames: ReadonlyArray<{ readonly name: string }>): ListVehicleBrandsIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      return {
        brands: await Promise.all(
          brandnames.map(async ({ name }: { readonly name: string }) => {
            const { mainImageUrl }: BrandImage = await this._vehicleImageService.getImageForBrandName(name, {
              fallbackNotFoundToDefaultImage: true,
            });
            return {
              name,
              image: mainImageUrl,
            };
          }),
        ),
      };
    });
  }
}
