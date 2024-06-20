import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { VehicleInformationsDto } from 'src/domain/_layer/data/dto/vehicle-informations.dto';

export type GetVehicleInformationsDomainErrors = UnknownDomainError;

export type GetVehicleInformationsResult = Either<GetVehicleInformationsDomainErrors, VehicleInformationsDto>;

export type GetVehicleInformationsIO = EitherIO<GetVehicleInformationsDomainErrors, VehicleInformationsDto>;

export type GetVehicleInformationsInput = {
  plate: string;
};

export abstract class GetVehicleInformationsDomain {
  abstract execute(input: GetVehicleInformationsInput): GetVehicleInformationsIO;
}
