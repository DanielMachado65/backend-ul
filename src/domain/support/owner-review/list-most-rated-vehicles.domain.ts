import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { DataNotFoundDomainError, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { VehiclePreviewDto } from 'src/domain/_layer/data/dto/vehicle-abouts.dto';

export type ListMostRatedVehiclesDomainErrors = DataNotFoundDomainError | ProviderUnavailableDomainError;

export type ListMostRatedVehiclesResult = Either<ListMostRatedVehiclesDomainErrors, ReadonlyArray<VehiclePreviewDto>>;

export type ListMostRatedVehiclesIO = EitherIO<ListMostRatedVehiclesDomainErrors, ReadonlyArray<VehiclePreviewDto>>;

export abstract class ListMostRatedVehiclesDomain {
  abstract listMostRated(): ListMostRatedVehiclesIO;
}
