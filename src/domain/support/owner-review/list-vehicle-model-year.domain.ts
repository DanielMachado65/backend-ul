import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { ListVehicleModelYearsDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';

export type ListVehicleModelYearsDomainErrors = ProviderUnavailableDomainError;

export type ListVehicleModelYearsResult = Either<ListVehicleModelYearsDomainErrors, ListVehicleModelYearsDto>;

export type ListVehicleModelYearsIO = EitherIO<ListVehicleModelYearsDomainErrors, ListVehicleModelYearsDto>;

export abstract class ListVehicleModelYearsDomain {
  abstract listModelYearByModel(brandName: string, model: string): ListVehicleModelYearsIO;

  abstract listModelYearByModelV2(brandName: string, model: string): ListVehicleModelYearsIO;
}
