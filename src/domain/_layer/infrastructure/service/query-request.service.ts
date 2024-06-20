import { QueryKeysDto } from 'src/domain/_layer/data/dto/query-keys.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ReplacedServiceRefDto } from 'src/domain/_layer/data/dto/service.dto';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { ReprocessInfosDto } from 'src/domain/core/query/v2/response-query.domain';

export type RequestQuerySupportInfos = {
  readonly userName?: string;
  readonly userEmail?: string;
};

export type RequestQueryServiceInput = {
  readonly templateQueryRef: string;
  readonly queryRef: string;
  readonly keys: QueryKeysDto;
  readonly support?: RequestQuerySupportInfos;
};

export type ReprocessQueryServiceInput = {
  readonly queryRef: string;
};

export type ReprocessReplacedServicesInput = {
  readonly queryRef: string;
  readonly services: ReadonlyArray<ReplacedServiceRefDto>;
};

export abstract class QueryRequestService {
  abstract requestQuery(input: RequestQueryServiceInput): Promise<void>;
  abstract reprocessQuery(input: ReprocessQueryServiceInput): Promise<void>;
  abstract getQueryByReference(externalReference: string): Promise<QueryResponseDto | null>;
  abstract parseTestDriveResponse(queryResponseDto: QueryResponseDto): Partial<TestDriveQueryDto>;
  abstract reprocessQueryByReplacedServices(input: ReprocessReplacedServicesInput): Promise<void>;
  abstract getAsyncQueryByReference(queryId: string, requestTimeout?: number): Promise<QueryResponseDto | null>;
  abstract parseQueryResponse(
    queryResponseDto: QueryResponseDto,
    reprocessInfos?: ReprocessInfosDto,
  ): Partial<QueryDto>;
  abstract parseCreditQuery(queryResponseDto: QueryResponseDto): Partial<QueryDto>;
}
