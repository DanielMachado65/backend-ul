import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import {
  GetProviderDataDto,
  ProviderServiceDataDto,
  ProviderServiceResponseDto,
  ProviderVehicleData,
} from '../../domain/_layer/data/dto/get-provider-data.dto';
import { QueryKeysDto } from '../../domain/_layer/data/dto/query-keys.dto';
import { QueryProviderService } from '../../domain/_layer/infrastructure/service/query-provider.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { LoggingAxiosInterceptor } from '../interceptor/logging-axios.interceptor';

export type ProviderServiceResponseHeaderInfoAddressKeys = {
  readonly bairro?: string;
  readonly cidade?: string;
  readonly complemento?: string;
  readonly logradouro?: string;
  readonly cep?: string;
  readonly uf?: string;
  readonly numeroDe?: string;
  readonly numeroAte?: string;
};

export type ProviderServiceResponseHeaderInfoKeys = {
  readonly endereco?: ProviderServiceResponseHeaderInfoAddressKeys;
  readonly placa?: string;
  readonly numCarroceria?: string;
  readonly caixaCambio?: string;
  readonly terceiroEixo?: string;
  readonly eixoTraseiro?: string;
  readonly cpf?: string;
  readonly cnpj?: string;
  readonly telefone?: string;
  readonly email?: string;
  readonly nome?: string;
  readonly nomeDaMae?: string;
  readonly sexo?: string;
  readonly dataNascimento?: string;
  readonly cmc7?: string;
  readonly cnh?: string;
  readonly chassi?: string;
  readonly renavam?: string;
  readonly motor?: string;
  readonly uf?: string;
};

export type ProviderServiceResponseHeaderInfo = {
  readonly queryid: string;
  readonly serviceCode: number;
  readonly name: string;
  readonly supplierCode: number;
  readonly date: string;
  readonly keys: ProviderServiceResponseHeaderInfoKeys;
  readonly isAsyncQuery: boolean;
  readonly byPass: boolean;
};

export type ProviderServiceResponse = {
  readonly headerInfos: ProviderServiceResponseHeaderInfo;
  readonly rawData: unknown;
  readonly dataFound: boolean;
  readonly isSuccessful: boolean;
};

export type ProviderServiceData = {
  readonly hasSuccessfulResponse: boolean;
  readonly hasDataFound: boolean;
  readonly requestedServiceCode: number;
  readonly responses: ReadonlyArray<ProviderServiceResponse>;
};

export type GetProviderDataBody = {
  readonly correlationId: string;
  readonly services?: ReadonlyArray<ProviderServiceData>;
  readonly vehicle?: ProviderVehicleData;
};

export type GetProviderDataStatus = {
  readonly cod: number;
  readonly msg: string;
};

export type GetProviderDataResponseDto = {
  readonly status: GetProviderDataStatus;
  readonly body: GetProviderDataBody;
};

@Injectable()
export class QueryMolecularService implements QueryProviderService {
  private static readonly TARGET_HEADER: string = 'molecular';

  private readonly _minute: number = 60 * 1000;
  private readonly _baseUrl: string;

  constructor(private readonly _httpService: HttpService, private readonly _envService: EnvService) {
    this._baseUrl = _envService.get(ENV_KEYS.MOLECULAR_BASE_URL);
  }

  private static _mapProviderInput(data: QueryKeysDto): ProviderServiceResponseHeaderInfoKeys {
    return data
      ? {
          placa: data.plate,
          chassi: data.chassis,
          motor: data.engine,
          endereco: { cep: data.zipCode },
        }
      : {};
  }

  private static _mapProviderResponse(response: ProviderServiceResponse): ProviderServiceResponseDto {
    return {
      rawData: response.rawData,
      dataFound: response.dataFound,
      isSuccessful: response.isSuccessful,
      headerInfos: response.headerInfos && {
        queryId: response.headerInfos.queryid,
        serviceCode: response.headerInfos.serviceCode,
        serviceName: response.headerInfos.name,
        supplierCode: response.headerInfos.supplierCode,
        queriedAt: response.headerInfos.date,
        isAsyncQuery: response.headerInfos.isAsyncQuery,
        byPass: response.headerInfos.byPass,
        queryKeys: response.headerInfos.keys && {
          plate: response.headerInfos.keys.placa,
          chassis: response.headerInfos.keys.chassi,
          cpf: response.headerInfos.keys.cpf,
          cnpj: response.headerInfos.keys.cnpj,
          phone: response.headerInfos.keys.telefone,
          email: response.headerInfos.keys.email,
          name: response.headerInfos.keys.nome,
          motherName: response.headerInfos.keys.nomeDaMae,
          gender: response.headerInfos.keys.sexo,
          birthDate: response.headerInfos.keys.dataNascimento,
          renavam: response.headerInfos.keys.renavam,
          engine: response.headerInfos.keys.motor,
          state: response.headerInfos.keys.uf,
          address: response.headerInfos.keys.endereco && {
            neighborhood: response.headerInfos.keys.endereco.bairro,
            city: response.headerInfos.keys.endereco.cidade,
            complement: response.headerInfos.keys.endereco.complemento,
            street: response.headerInfos.keys.endereco.logradouro,
            zipCode: response.headerInfos.keys.endereco.cep,
            state: response.headerInfos.keys.endereco.uf,
            numberStart: response.headerInfos.keys.endereco.numeroDe,
            numberEnd: response.headerInfos.keys.endereco.numeroAte,
          },
        },
      },
    };
  }

  private static _mapProviderOutput(data: GetProviderDataResponseDto): GetProviderDataDto {
    return (
      data?.body && {
        vehicle: data.body.vehicle,
        services:
          data.body.services
            ?.filter((service: ProviderServiceData) => Array.isArray(service.responses) && service.responses.length > 0)
            ?.map((service: ProviderServiceData) =>
              service.responses.reduce(
                (acc: ProviderServiceDataDto, response: ProviderServiceResponse) => {
                  const responseDto: ProviderServiceResponseDto = QueryMolecularService._mapProviderResponse(response);
                  return response.headerInfos?.serviceCode === service.requestedServiceCode
                    ? { ...acc, requestedResponse: responseDto }
                    : {
                        ...acc,
                        fallbackResponses: [...acc.fallbackResponses, responseDto],
                      };
                },
                {
                  isSuccessfulGroup: service.hasSuccessfulResponse,
                  hasDataFound: service.hasDataFound,
                  requestedResponse: null,
                  fallbackResponses: [],
                },
              ),
            ) || [],
      }
    );
  }

  async processServices(
    serviceCodes: ReadonlyArray<number>,
    queryKeys: QueryKeysDto,
    correlationId: string | null = null,
    reqParentId: string | null = null,
  ): Promise<GetProviderDataDto> {
    const url: string = this._baseUrl + '/api/query/by-data-integrations/5be58fd8cce1db1aa08e2eb6';
    const body: unknown = {
      serviceCodes: serviceCodes,
      keys: QueryMolecularService._mapProviderInput(queryKeys),
      correlationId,
    };

    const response$: Observable<AxiosResponse<GetProviderDataResponseDto>> = this._httpService.post(url, body, {
      headers: LoggingAxiosInterceptor.makeLogHeaders(reqParentId, QueryMolecularService.TARGET_HEADER),
      timeout: 5 * this._minute,
    });
    const response: AxiosResponse<GetProviderDataResponseDto> = await firstValueFrom(response$);
    return QueryMolecularService._mapProviderOutput(response.data);
  }
}
