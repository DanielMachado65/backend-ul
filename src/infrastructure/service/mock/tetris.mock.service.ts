import { Injectable } from '@nestjs/common';
import { mockTestDriveResponseJson } from 'src/data/core/query/tests/mocks/test-drive-response-json.mock';
import { QueryResponseEntity, QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import { QueryEntity, QueryStatus } from 'src/domain/_entity/query.entity';
import {
  TestDriveQueryEntity,
  TestDriveQueryStatus,
  TestDriveResponseJson,
} from 'src/domain/_entity/test-drive-query.entity';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import {
  QueryRequestService,
  ReprocessQueryServiceInput,
  ReprocessReplacedServicesInput,
  RequestQueryServiceInput,
} from 'src/domain/_layer/infrastructure/service/query-request.service';

@Injectable()
export class TetrisMockService implements QueryRequestService {
  async reprocessQueryByReplacedServices(_input: ReprocessReplacedServicesInput): Promise<void> {
    return Promise.resolve();
  }
  async requestQuery(_input: RequestQueryServiceInput): Promise<void> {
    return Promise.resolve();
  }

  async reprocessQuery(_input: ReprocessQueryServiceInput): Promise<void> {
    return Promise.resolve();
  }

  async getQueryByReference(_externalReference: string): Promise<QueryResponseEntity> {
    throw new Error('Method not implemented.');
  }

  async getAsyncQueryByReference(_externalReference: string, _requestTimeout: number): Promise<QueryResponseEntity> {
    throw new Error('Method not implemented.');
  }

  parseTestDriveResponse(queryResponseDto: QueryResponseEntity): Partial<TestDriveQueryEntity> {
    const responseJson: TestDriveResponseJson = mockTestDriveResponseJson();
    return {
      id: queryResponseDto.queryRef,
      servicesToReprocess: queryResponseDto.servicesToReprocess,
      status: queryResponseDto.status === QueryResponseStatus.SUCCESS,
      queryStatus:
        queryResponseDto.status === QueryResponseStatus.SUCCESS
          ? TestDriveQueryStatus.SUCCESS
          : TestDriveQueryStatus.FAILURE,

      responseJson,
    };
  }

  parseQueryResponse(queryResponseDto: QueryResponseEntity): Partial<QueryEntity> {
    return {
      id: queryResponseDto.queryRef,
      status: queryResponseDto.status === QueryResponseStatus.SUCCESS ? QueryStatus.SUCCESS : QueryStatus.FAILURE,
      queryStatus: queryResponseDto.status === QueryResponseStatus.SUCCESS ? QueryStatus.SUCCESS : QueryStatus.FAILURE,
      responseJson: {
        chassi: 'any_chassi',
      },
    };
  }

  parseCreditQuery(queryResponseDto: QueryResponseDto): Partial<QueryEntity> {
    return {
      id: queryResponseDto.queryRef,
      status: queryResponseDto.status === QueryResponseStatus.SUCCESS ? QueryStatus.SUCCESS : QueryStatus.FAILURE,
      queryStatus: queryResponseDto.status === QueryResponseStatus.SUCCESS ? QueryStatus.SUCCESS : QueryStatus.FAILURE,
      responseJson: null,
    };
  }
}
