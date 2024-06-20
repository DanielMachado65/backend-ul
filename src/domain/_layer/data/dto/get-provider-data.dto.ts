import { QueryDebitsContent, QueryKeys, QueryResponseJson } from '../../../_entity/query.entity';

export type ProviderVehicleData = QueryResponseJson;

export type ProviderServiceResponseHeaderInfoDto = {
  readonly queryId: string;
  readonly serviceCode: number;
  readonly serviceName: string;
  readonly supplierCode: number;
  readonly queriedAt: string;
  readonly queryKeys: QueryKeys;
  readonly isAsyncQuery: boolean;
  readonly byPass: boolean;
};

export type ProviderServiceResponseDto = {
  readonly headerInfos: ProviderServiceResponseHeaderInfoDto;
  readonly rawData: unknown;
  readonly dataFound: boolean;
  readonly isSuccessful: boolean;
};

export type ProviderServiceDataDto = {
  readonly isSuccessfulGroup: boolean;
  readonly hasDataFound: boolean;
  readonly requestedResponse: ProviderServiceResponseDto;
  readonly fallbackResponses: ReadonlyArray<ProviderServiceResponseDto>;
};

export type GetProviderDataDto = {
  readonly services: ReadonlyArray<ProviderServiceDataDto>;
  readonly vehicle: ProviderVehicleData;
};

export type DebitsData = QueryDebitsContent;

export type ProviderStackResultRepsonse = {
  readonly rawData: object;
  readonly dataFound: boolean;
  readonly isSuccessful: boolean;
  readonly headerInfos: {
    readonly serviceCode: number;
  };
};

export type ProviderServiceDataQueueDto = {
  readonly hasSuccessfulResponse: boolean;
  readonly hasDataFound: boolean;
  readonly requestedServiceCode: number;
  readonly responses: ReadonlyArray<unknown>;
};

export type GetProviderDataQueueDto = {
  readonly services: ReadonlyArray<ProviderServiceDataQueueDto>;
  readonly vehicle: ProviderVehicleData;
};
