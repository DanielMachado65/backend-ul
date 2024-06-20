import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { QueryComposeStatus } from 'src/domain/_entity/query-composer.entity';
import {
  BlacklistKeysDomainError,
  QueryCannotBeRequestedDomainError,
  QueryRequestFailError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import {
  TestDriveQueryDocumentType,
  TestDriveQueryKeys,
  TestDriveQueryStatus,
} from 'src/domain/_entity/test-drive-query.entity';
import { CityZipCodeDto } from 'src/domain/_layer/data/dto/city-zipcode.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { QueryKeysDto } from 'src/domain/_layer/data/dto/query-keys.dto';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { CityZipCodeRepository } from 'src/domain/_layer/infrastructure/repository/city-zipcode.repository';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { TestDriveQueryRepository } from 'src/domain/_layer/infrastructure/repository/test-drive-query.repository';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { RequestTestDriveDomain, RequestTestDriveIO } from 'src/domain/core/query/v2/request-test-drive.domain';
import { DateTime, DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

type QueryComposerAndCityZipCode = {
  readonly queryComposer: QueryComposerDto;
  readonly cityZipCode: CityZipCodeDto;
};

type QueryComposerAndTestDriveDto = {
  readonly queryComposer: QueryComposerDto;
  readonly testDriveDto: TestDriveQueryDto;
};
@Injectable()
export class RequestTestDriveUseCase implements RequestTestDriveDomain {
  constructor(
    private readonly _queryComposerRepository: QueryComposerRepository,
    private readonly _cityZipCodeRepository: CityZipCodeRepository,
    private readonly _testDriveQueryRepository: TestDriveQueryRepository,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {}

  requestTestDrive(keys: TestDriveQueryKeys, ip: string, mayBeUser: string, userCity: string): RequestTestDriveIO {
    return EitherIO.of(UnknownDomainError.toFn(), keys)
      .filter(BlacklistKeysDomainError.toFn(), () => !RequestTestDriveUseCase._hasKeysInBlackList(keys))
      .map(() => this._queryComposerRepository.getByQueryCode(RequestTestDriveDomain.QUERY_CODE))
      .filter(
        QueryCannotBeRequestedDomainError.toFn(),
        ({ canBeTestDrive, status, serviceIds }: QueryComposerDto) =>
          canBeTestDrive && status === QueryComposeStatus.ACTIVATED && serviceIds.length > 0,
      )
      .map(async (queryComposer: QueryComposerDto) => {
        const cityZipCode: CityZipCodeDto = await this._cityZipCodeRepository.findZipCodeByCityName(userCity);
        return { queryComposer, cityZipCode };
      })
      .map(async ({ queryComposer, cityZipCode }: QueryComposerAndCityZipCode) => {
        const testDriveDto: TestDriveQueryDto = await this._testDriveQueryRepository.insert({
          queryKeys: {
            ...keys,
            state: cityZipCode?.state,
          },
          queryCode: queryComposer.queryCode,
          executionTime: 0,
          control: {
            requestIp: ip,
          },

          userId: mayBeUser,
          refClass: queryComposer.name,
          documentType: TestDriveQueryDocumentType.PLATE,
          documentQuery: keys.plate,
        });
        return { queryComposer, testDriveDto };
      })
      .flatMap(({ queryComposer, testDriveDto }: QueryComposerAndTestDriveDto) =>
        this._requestQuery(queryComposer, testDriveDto, keys),
      );
  }

  private _requestQuery(
    queryComposer: QueryComposerDto,
    testDriveDto: TestDriveQueryDto,
    keys: TestDriveQueryKeys,
  ): RequestTestDriveIO {
    return EitherIO.from(QueryRequestFailError.toFn(), async () => {
      const templateQueryRef: string = queryComposer.queryCode.toString();
      const queryRef: string = testDriveDto.id;
      await this._queryRequestService.requestQuery({ templateQueryRef, keys, queryRef });
      return testDriveDto;
    }).catch(async (error: QueryRequestFailError) => {
      if (testDriveDto?.id !== null && testDriveDto?.id !== undefined) {
        const startTime: DateTime = this._dateTimeUtil.fromIso(testDriveDto.createdAt);
        const executionTime: number = this._dateTimeUtil.now().diff(startTime) / 1000;
        await this._testDriveQueryRepository.updateById(testDriveDto.id, {
          executionTime,
          status: false,
          queryStatus: TestDriveQueryStatus.FAILURE,
        });
      }
      return Either.left(error);
    });
  }

  private static _hasKeysInBlackList(keys: QueryKeysDto): boolean {
    return keys.plate === 'AYB0731' || keys.chassis === '93Y4SRD64EJ830469';
  }
}
