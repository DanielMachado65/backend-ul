import { Injectable } from '@nestjs/common';
import { ServiceResponseStatus, StackResult } from 'src/domain/_entity/query-response.entity';
import { QueryFailedService, QueryStackResultService } from 'src/domain/_entity/query.entity';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { ServiceRepository } from 'src/domain/_layer/infrastructure/repository/service.repository';

export type CreateQueryStackResultAndFailedServicesData = {
  readonly result: QueryStackResultService;
  readonly failure: QueryFailedService;
};

export type QueryStackResultAndFailedServices = {
  readonly stackResult: ReadonlyArray<QueryStackResultService>;
  readonly failedServices: ReadonlyArray<QueryFailedService>;
};

@Injectable()
export class QueryResponseHelper {
  constructor(private readonly _serviceRepository: ServiceRepository) {}

  async createStackResultAndFailedServices(
    { stackResult, failedServices }: QueryResponseDto,
    shouldObfuscateResponse?: boolean,
  ): Promise<QueryStackResultAndFailedServices> {
    const promises: ReadonlyArray<Promise<CreateQueryStackResultAndFailedServicesData>> = stackResult
      ?.filter((result: StackResult) => Number.isInteger(parseInt(result.serviceRef)))
      .map(async (result: StackResult) => {
        const service: ServiceDto = await this._serviceRepository.getByServiceCode(parseInt(result.serviceRef));

        let failedService: QueryFailedService = null;
        if (result.status === ServiceResponseStatus.FAILED && failedServices.includes(result.serviceId)) {
          failedService = {
            serviceCode: service.code,
            serviceName: service.name,
            supplierCode: service.supplier.code,
            supplierName: service.supplier.name,
          };
        }

        const rawResponse: unknown = result?.providerResponse || result?.stackErrors;

        const rawData: unknown = shouldObfuscateResponse
          ? this._obfuscateResponse(result?.providerResponse)
          : rawResponse;

        const serviceStackResult: QueryStackResultService = {
          rawData,
          serviceCode: service.code,
          supplierCode: service.supplier.code,
          serviceName: service.name,
          supplierName: service.supplier.name,
          hasError: result?.stackErrors?.length > 0,
          dataFound: result?.status === ServiceResponseStatus.SUCCESS,
        };

        return { result: serviceStackResult, failure: failedService };
      });
    const values: ReadonlyArray<CreateQueryStackResultAndFailedServicesData> = await Promise.all(promises);
    return values.reduce(
      (acc: QueryStackResultAndFailedServices, value: CreateQueryStackResultAndFailedServicesData) => {
        const hasFailedService: boolean = !!acc.failedServices.find(
          (failedService: QueryFailedService) => failedService.serviceCode === value.result.serviceCode,
        );

        return value.failure && !hasFailedService
          ? {
              stackResult: [...acc.stackResult, value.result],
              failedServices: [...acc.failedServices, value.failure],
            }
          : { ...acc, stackResult: [...acc.stackResult, value.result] };
      },
      { stackResult: [], failedServices: [] },
    );
  }

  private _obfuscateResponse(obj: unknown): object {
    try {
      return Object.keys(obj).reduce((acc: object, key: string) => {
        if (obj[key] !== null && typeof obj[key] === 'object') {
          acc[key] = this._obfuscateResponse(obj[key]);
        } else acc[key] = !!obj[key];
        return acc;
      }, {});
    } catch (e) {
      console.log(e);
    }
    return null;
  }
}
