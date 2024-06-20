import { PreQueryEntity } from 'src/domain/_entity/pre-query.entity';
import { VehicleInformationsEntity } from 'src/domain/_entity/vehicle-informations.entity';
import { PreQueryInputDto } from 'src/domain/core/query/get-pre-query.domain';

export abstract class StaticDataService {
  abstract getPreQuery(input: Partial<PreQueryInputDto>): Promise<PreQueryEntity>;
  abstract getInformationsByPlate(plate: string): Promise<VehicleInformationsEntity>;
}
