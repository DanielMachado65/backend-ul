import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { ListVehicleModelsDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';

export type ListVehicleModelsDomainErrors = ProviderUnavailableDomainError;

export type ListVehicleModelsResult = Either<ListVehicleModelsDomainErrors, ListVehicleModelsDto>;

export type ListVehicleModelsIO = EitherIO<ListVehicleModelsDomainErrors, ListVehicleModelsDto>;

export abstract class ListVehicleModelsDomain {
  abstract listModelsByBrand(brandName: string): ListVehicleModelsIO;

  abstract listModelsByBrandV2(brandName: string): ListVehicleModelsIO;
}
