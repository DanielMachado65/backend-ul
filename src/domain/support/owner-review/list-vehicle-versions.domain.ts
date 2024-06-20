import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { ListVehicleVersionsByPlateDto, ListVehicleVersionsDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';

export type ListVehicleVersionsDomainErrors = ProviderUnavailableDomainError;

export type ListVehicleVersionsResult = Either<ListVehicleVersionsDomainErrors, ListVehicleVersionsDto>;

export type ListVehicleVersionsIO = EitherIO<ListVehicleVersionsDomainErrors, ListVehicleVersionsDto>;

export type ListVehicleVersionsByPlateDomainErrors = ProviderUnavailableDomainError;

export type ListVehicleVersionsByPlateResult = Either<ListVehicleVersionsDomainErrors, ListVehicleVersionsByPlateDto>;

export type ListVehicleVersionsByPlateIO = EitherIO<ListVehicleVersionsDomainErrors, ListVehicleVersionsByPlateDto>;

export abstract class ListVehicleVersionsDomain {
  abstract listVersionsByBrandModelYear(brandName: string, model: string, year: number): ListVehicleVersionsIO;

  abstract listVersionsByPlate(plate: string): ListVehicleVersionsByPlateIO;
}
