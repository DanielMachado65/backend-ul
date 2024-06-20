import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { QueryParserService } from '../../domain/_layer/infrastructure/service/query-parser.service';
import { ClientType } from '../../domain/_entity/client.entity';
import { QueryParsedData } from '../../domain/_entity/query-representation.entity';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class QueryRosettaService implements QueryParserService {
  private readonly _baseUrl: string;

  constructor(private readonly _httpService: HttpService, private readonly _envService: EnvService) {
    this._baseUrl = _envService.get(ENV_KEYS.ROSETTA_BASE_URL);
  }

  async parseQuery(
    queryCode: number,
    clientType: ClientType,
    responseJson: unknown,
    templateVersion: number = 0,
  ): Promise<QueryParsedData> {
    const url: string = this._baseUrl + '/query/parse?client=' + clientType;
    const code: number = queryCode;
    const version: number = templateVersion;
    const body: Record<string, unknown> = { code, responseJson, version };
    const response$: Observable<AxiosResponse<QueryParsedData>> = this._httpService.post(url, body);
    const response: AxiosResponse<QueryParsedData> = await firstValueFrom(response$);
    return response.data;
  }
}
