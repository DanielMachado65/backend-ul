import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ListVehicleVersionsByPlateIO,
  ListVehicleVersionsDomain,
  ListVehicleVersionsIO,
} from 'src/domain/support/owner-review/list-vehicle-versions.domain';
import { DataNotFoundDomainError, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { VehicleVersionEntity } from 'src/domain/_entity/vehicle-version.entity';
import { ListVehicleVersionsByPlateDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';
import {
  VehicleVersion,
  VehicleVersionService,
  VersionAbout,
} from 'src/domain/_layer/infrastructure/service/vehicle-version.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { randomUUID } from 'crypto';
import { QueryResponseEntity } from 'src/domain/_entity/query-response.entity';
import { BasicVehicleFipeVo } from 'src/domain/value-object/basic-vechicle.vo';

@Injectable()
export class ListVehicleVersionsUseCase implements ListVehicleVersionsDomain {
  constructor(
    private readonly _vehicleVersionService: VehicleVersionService,
    private readonly _queryRequestService: QueryRequestService,
  ) {}

  listVersionsByBrandModelYear(brandName: string, model: string, year: number): ListVehicleVersionsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._vehicleVersionService.getVersions(brandName, model, year),
    ).map((versions: ReadonlyArray<VehicleVersion>) => ({
      versions: versions.map(
        (version: VehicleVersion): VehicleVersionEntity => ({
          versionName: version.versionName,
          fipeId: version.fipeCode.replace('-', ''),
        }),
      ),
    }));
  }

  listVersionsByPlate(plate: string): ListVehicleVersionsByPlateIO {
    type FipeInformationDataExtended = {
      brandName: string;
      modelName: string;
      fipeId: string;
      versionName: string;
    };

    const queryRef: string = `owner-review-list-${randomUUID()}`;
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._queryRequestService.requestQuery({
        keys: { plate },
        queryRef,
        templateQueryRef: '20000',
      }),
    )
      .map(() => this._queryRequestService.getAsyncQueryByReference(queryRef))
      .filter(
        DataNotFoundDomainError.toFn(),
        (data: QueryResponseEntity) =>
          typeof data.response.basicVehicle.modelYear === 'number' && data.response.basicVehicle?.fipeData?.length > 0,
      )
      .map(async (data: QueryResponseEntity): Promise<ListVehicleVersionsByPlateDto> => {
        const abouts: ReadonlyArray<VersionAbout> = await this._vehicleVersionService.getMultipleVersionAbout(
          data.response.basicVehicle.fipeData.map((fipeData: BasicVehicleFipeVo): string =>
            this._fixNumberFipeId(fipeData.fipeId),
          ),
          data.response.basicVehicle.modelYear,
        );

        const informacoesFipeUpdated: ReadonlyArray<FipeInformationDataExtended> =
          data.response.basicVehicle.fipeData.map((fipeData: BasicVehicleFipeVo): FipeInformationDataExtended => {
            const fipeId: string = this._fixNumberFipeId(fipeData.fipeId);
            const about: VersionAbout = abouts.find(
              (about: VersionAbout) => about.fipeCode.replace('-', '') === fipeId,
            );

            return {
              versionName: about.versionName,
              brandName: about.brandName,
              modelName: about.modelName,
              fipeId,
            };
          });

        return {
          brandYear: data.response.basicVehicle.manufactureYear,
          codModelBrand: String(data.response.aggregate.modelBrandCode),
          modelYear: data.response.aggregate.modelYear,
          vehicleVersions: informacoesFipeUpdated,
        };
      });
  }

  private _fixNumberFipeId(fipeId: number): string {
    return fipeId.toFixed().padStart(7, '0');
  }
}
