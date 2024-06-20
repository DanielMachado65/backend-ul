import { IsObject, IsString } from 'class-validator';
import { firstValueFrom, Observable } from 'rxjs';
import { LocationService } from 'src/domain/_layer/infrastructure/service/location.service';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { AxiosResponse } from 'axios';
import { CityDto } from 'src/domain/_layer/data/dto/city.dto';
import { StateDto } from 'src/domain/_layer/data/dto/state.dto';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';
import { EnvService, ENV_KEYS } from '../framework/env.service';
import { CacheHttpService } from './cache-http.service';
import * as https from 'https';

class ExternalCity {
  @IsString()
  nome: string;
}

class ExternalRegion {
  @IsString()
  sigla: string;

  @IsString()
  nome: string;
}

class ExternalState {
  @IsString()
  nome: string;

  @IsObject()
  @Type(() => ExternalRegion)
  regiao: ExternalRegion;

  @IsString()
  sigla: string;
}

@Injectable()
export class IBGEService implements LocationService {
  private readonly _baseUrl: string;
  private readonly _https: https.Agent = new https.Agent({
    rejectUnauthorized: false,
  });

  constructor(
    private readonly _httpService: CacheHttpService,
    private readonly _validatorUtil: ClassValidatorUtil,
    private readonly _envService: EnvService,
  ) {
    this._baseUrl = _envService.get(ENV_KEYS.IBGE_BASE_URL);
  }

  async getStates(): Promise<ReadonlyArray<StateDto>> {
    const states: ReadonlyArray<ExternalState> = await this._fetchStates();
    return states.map((state: ExternalState) => ({
      code: state.sigla.toUpperCase(),
      name: state.nome,
      region: state.regiao.nome,
    }));
  }

  async getCities(state: string): Promise<ReadonlyArray<CityDto>> {
    const cities: ReadonlyArray<ExternalCity> = await this._fetchCities(state);
    return cities.map((state: ExternalCity) => ({
      name: state.nome,
    }));
  }

  private async _fetchStates(): Promise<ReadonlyArray<ExternalState>> {
    const httpResponse: Observable<AxiosResponse<ReadonlyArray<ExternalState>>> = this._httpService.get(
      `${this._baseUrl}/api/v1/localidades/estados`,
      { httpsAgent: this._https },
    );
    const response: AxiosResponse<ReadonlyArray<ExternalState>> = await firstValueFrom(httpResponse);
    const states: ReadonlyArray<ExternalState> = await Promise.all(
      response.data.map((elem: ExternalState) =>
        this._validatorUtil.validateAndResult(elem, ExternalState).unsafeRun(),
      ),
    );
    return states;
  }

  private async _fetchCities(state: string): Promise<ReadonlyArray<ExternalCity>> {
    const httpResponse: Observable<AxiosResponse<ReadonlyArray<ExternalCity>>> = this._httpService.get(
      `${this._baseUrl}/api/v1/localidades/estados/${state}/municipios`,
      { httpsAgent: this._https },
    );
    const response: AxiosResponse<ReadonlyArray<ExternalCity>> = await firstValueFrom(httpResponse);
    const cities: ReadonlyArray<ExternalCity> = await Promise.all(
      response.data.map((elem: ExternalCity) => this._validatorUtil.validateAndResult(elem, ExternalCity).unsafeRun()),
    );
    return cities;
  }
}
