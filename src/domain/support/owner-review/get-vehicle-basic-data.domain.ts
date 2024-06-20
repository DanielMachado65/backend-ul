import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { DataNotFoundDomainError, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { VehicleBasicDataDto, VehicleBasicDataV2Dto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';

export type GetVehicleAboutDataDomainErrors = DataNotFoundDomainError | ProviderUnavailableDomainError;

export type GetVehicleAboutDataResult = Either<GetVehicleAboutDataDomainErrors, VehicleBasicDataDto>;

export type GetVehicleAboutDataIO = EitherIO<GetVehicleAboutDataDomainErrors, VehicleBasicDataDto>;

export type GetVehicleAboutDataV2DomainErrors = DataNotFoundDomainError | ProviderUnavailableDomainError;

export type GetVehicleAboutDataV2Result = Either<GetVehicleAboutDataDomainErrors, VehicleBasicDataV2Dto>;

export type GetVehicleAboutDataV2IO = EitherIO<GetVehicleAboutDataDomainErrors, VehicleBasicDataV2Dto>;

export abstract class GetVehicleAboutDataDomain {
  abstract getByBrandModelYear(
    brandName: string,
    modelName: string,
    year: number,
    detailedModel: string,
  ): GetVehicleAboutDataIO;

  abstract getByBrandModelYearV2(versionCode: string, modelYear: number): GetVehicleAboutDataV2IO;
}
