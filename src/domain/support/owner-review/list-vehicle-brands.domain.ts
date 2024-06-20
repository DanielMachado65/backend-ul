import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { ListVehicleBrandsDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';

export type ListVehicleBrandsDomainErrors = ProviderUnavailableDomainError;

export type ListVehicleBrandsResult = Either<ListVehicleBrandsDomainErrors, ListVehicleBrandsDto>;

export type ListVehicleBrandsIO = EitherIO<ListVehicleBrandsDomainErrors, ListVehicleBrandsDto>;

export abstract class ListVehicleBrandsDomain {
  abstract listBrands(): ListVehicleBrandsIO;

  abstract listBrandsV2(): ListVehicleBrandsIO;
}
