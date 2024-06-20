import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { DataNotFoundDomainError, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { OwnerVehicleParams } from 'src/domain/_layer/data/dto/owner-vehicle-params.dto';

export type FindVehicleParamsDomainErrors = DataNotFoundDomainError | ProviderUnavailableDomainError;

export type FindVehicleParamsResult = Either<FindVehicleParamsDomainErrors, OwnerVehicleParams>;

export type FindVehicleParamsIO = EitherIO<FindVehicleParamsDomainErrors, OwnerVehicleParams>;

export abstract class FindVehicleParamsDomain {
  abstract findParamsByPlate(plate: string): FindVehicleParamsIO;
}
