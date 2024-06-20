import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  GetVehicleAboutDataDomain,
  GetVehicleAboutDataIO,
  GetVehicleAboutDataV2IO,
} from 'src/domain/support/owner-review/get-vehicle-basic-data.domain';
import { DataNotFoundDomainError, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import {
  OwnerReviewService,
  VehicleBasicInfo,
  VehicleBasicInfoByVersion,
} from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { BrandImage, VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';
import { VehicleVersionService, VersionAbout } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';

@Injectable()
export class GetVehicleAboutDataUseCase implements GetVehicleAboutDataDomain {
  constructor(
    private readonly _ownerReviewService: OwnerReviewService,
    private readonly _vehicleImageService: VehicleImageService,
    private readonly _vehicleVersionService: VehicleVersionService,
  ) {}

  getByBrandModelYear(
    brandName: string,
    modelName: string,
    year: number,
    detailedModel: string,
  ): GetVehicleAboutDataIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.getVehicleInfoByBrandModelYear(brandName, modelName, year, detailedModel),
    )
      .filter(DataNotFoundDomainError.toFn(), Boolean)
      .map(async (response: VehicleBasicInfo) => {
        const { mainImageUrl }: BrandImage = await this._vehicleImageService.getImageForBrandName(brandName, {
          fallbackNotFoundToDefaultImage: true,
        });
        return {
          ...response,
          brandImage: mainImageUrl,
        };
      });
  }

  getByBrandModelYearV2(fipeId: string, modelYear: number): GetVehicleAboutDataV2IO {
    type Data = { readonly ownerReview: VehicleBasicInfoByVersion; readonly vehicleVersion: VersionAbout };

    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._ownerReviewService.getVehicleInfoByVersion(fipeId),
    )
      .map(
        async (response: VehicleBasicInfoByVersion): Promise<Data> => ({
          ownerReview: response,
          vehicleVersion: await this._vehicleVersionService.getVersionAbout(fipeId, modelYear),
        }),
      )
      .filter(DataNotFoundDomainError.toFn(), (data: Data) => !!data.vehicleVersion)
      .map(async (data: Data) => {
        const hasOwnerReview: boolean = Boolean(data.ownerReview);

        const { mainImageUrl }: BrandImage = await this._vehicleImageService.getImageForBrandName(
          hasOwnerReview ? data.ownerReview.brandName : data.vehicleVersion.brandName,
          {
            fallbackNotFoundToDefaultImage: true,
          },
        );

        if (hasOwnerReview) {
          return {
            brandName: data.vehicleVersion.brandName,
            modelName: data.vehicleVersion.modelName,
            versionName: data.vehicleVersion.versionName,
            modelYear: data.vehicleVersion.modelYear,
            brandImage: mainImageUrl,
            hasAnyReviewWithLikes: data.ownerReview.hasAnyReviewWithLikes,
            averageRanking: data.ownerReview.averageRanking,
          };
        } else {
          return {
            brandName: data.vehicleVersion.brandName,
            modelName: data.vehicleVersion.modelName,
            versionName: data.vehicleVersion.versionName,
            modelYear: data.vehicleVersion.modelYear,
            brandImage: mainImageUrl,
            hasAnyReviewWithLikes: null,
            averageRanking: null,
          };
        }
      });
  }
}
