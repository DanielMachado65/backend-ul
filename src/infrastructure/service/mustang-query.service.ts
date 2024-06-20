import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';

import { PreQueryEntity } from 'src/domain/_entity/pre-query.entity';
import { VehicleInformationsEntity } from 'src/domain/_entity/vehicle-informations.entity';
import { StaticDataService } from 'src/domain/_layer/infrastructure/service/static-data.service';
import { PreQueryInputDto } from 'src/domain/core/query/get-pre-query.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';

@Injectable()
export class MustangQueryService implements StaticDataService {
  private readonly _baseUrl: string = this._envService.get(ENV_KEYS.MUSTANG_URL_BASE);

  constructor(private readonly _httpService: HttpService, private readonly _envService: EnvService) {}

  async getPreQuery(input: Partial<PreQueryInputDto>): Promise<PreQueryEntity> {
    const response$: Observable<AxiosResponse<PreQueryEntity>> = this._httpService.post(
      `${this._baseUrl}/vehicle-aggregate/pre-query`,
      {
        plate: input.plate,
        chassis: input.chassis,
        engineNumber: input.engineNumber,
      },
    );
    const response: AxiosResponse<PreQueryEntity> = await firstValueFrom(response$);

    return {
      plate: (response.data && response.data.plate) || null,
      chassis: (response.data && response.data.chassis) || null,
      engineNumber: (response.data && response.data.chassis) || null,
      brand: (response.data && response.data.brand) || null,
      model: (response.data && response.data.model) || null,
    };
  }

  async getInformationsByPlate(plate: string): Promise<VehicleInformationsEntity> {
    const url: string = `${this._baseUrl}/vehicle-informations/has-internal-informations?plate=${plate}`;
    const response$: Observable<AxiosResponse<VehicleInformationsEntity>> = this._httpService.get(url);
    const response: AxiosResponse<VehicleInformationsEntity> = await firstValueFrom(response$);

    return {
      hasKm: response.data.hasKm,
      hasPhotos: response.data.hasPhotos,
    };
  }
}
