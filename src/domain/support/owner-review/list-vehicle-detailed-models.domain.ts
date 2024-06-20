import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { ListVehicleDetailedModelsDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';

export type ListVehicleDetailedModelsDomainErrors = ProviderUnavailableDomainError;

export type ListVehicleDetailedModelsResult = Either<
  ListVehicleDetailedModelsDomainErrors,
  ListVehicleDetailedModelsDto
>;

export type ListVehicleDetailedModelsIO = EitherIO<ListVehicleDetailedModelsDomainErrors, ListVehicleDetailedModelsDto>;

export abstract class ListVehicleDetailedModelsDomain {
  abstract listDetailedModelsByBrandModelYear(
    brandName: string,
    model: string,
    year: number,
  ): ListVehicleDetailedModelsIO;
}
