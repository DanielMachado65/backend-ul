import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { PlateIsRequiredError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { VehicleInformationsDto } from 'src/domain/_layer/data/dto/vehicle-informations.dto';
import { StaticDataService } from 'src/domain/_layer/infrastructure/service/static-data.service';
import {
  GetVehicleInformationsDomain,
  GetVehicleInformationsIO,
  GetVehicleInformationsInput,
} from 'src/domain/core/query/get-vehicle-informations.domain';

@Injectable()
export class GetVehicleInformationsUseCase implements GetVehicleInformationsDomain {
  constructor(private readonly _staticDataService: StaticDataService) {}

  execute(input: GetVehicleInformationsInput): GetVehicleInformationsIO {
    return EitherIO.of(UnknownDomainError.toFn(), input?.plate)
      .filter(PlateIsRequiredError.toFn(), Boolean)
      .map(this._requestForStaticData());
  }

  private _requestForStaticData() {
    return (plate: string): Promise<VehicleInformationsDto> => {
      return this._staticDataService.getInformationsByPlate(plate);
    };
  }
}
