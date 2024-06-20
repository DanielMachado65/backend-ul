import { Injectable } from '@nestjs/common';
import { GetProviderDataDto } from 'src/domain/_layer/data/dto/get-provider-data.dto';
import { QueryKeysDto } from 'src/domain/_layer/data/dto/query-keys.dto';
import { QueryProviderService } from 'src/domain/_layer/infrastructure/service/query-provider.service';

@Injectable()
export class QueryMolecularMockService implements QueryProviderService {
  async processServices(
    serviceCodes: ReadonlyArray<number>,
    queryKeys: QueryKeysDto,
    _correlationId: string | null = null,
  ): Promise<GetProviderDataDto> {
    return {
      services: serviceCodes.map((serviceCode: number) => ({
        isSuccessfulGroup: true,
        hasDataFound: true,
        requestedResponse: {
          headerInfos: {
            queryId: '',
            serviceCode,
            serviceName: '',
            supplierCode: 1,
            queriedAt: '',
            queryKeys,
            isAsyncQuery: false,
            byPass: false,
          },
          dataFound: true,
          rawData: {},
          isSuccessful: true,
        },
        fallbackResponses: [],
      })),
      vehicle: { placa: 'teste' },
    };
  }
}
