import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TestDriveQueryStatus } from 'src/domain/_entity/test-drive-query.entity';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { TestDriveQueryRepository } from 'src/domain/_layer/infrastructure/repository/test-drive-query.repository';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { ResponseTestDriveDomain, ResponseTestDriveIO } from 'src/domain/core/query/v2/response-test-drive.domain';
import { DateTime, DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

@Injectable()
export class ResponseTestDriveUseCase implements ResponseTestDriveDomain {
  constructor(
    private readonly _testDriveQueryRepository: TestDriveQueryRepository,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {}

  responseTestDrive(queryResponseDto: QueryResponseDto): ResponseTestDriveIO {
    return (
      EitherIO.from(
        UnknownDomainError.toFn(),
        async () => await this._testDriveQueryRepository.getById(queryResponseDto.queryRef),
      )
        .flatMap((testDriveDto: TestDriveQueryDto) => this._parseQueryResponse(queryResponseDto, testDriveDto))
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .map(async ({ id, queryStatus, responseJson, status, executionTime }: Partial<TestDriveQueryDto>) => {
          await this._testDriveQueryRepository.updateById(id, {
            status,
            executionTime,
            responseJson,
            queryStatus,
          });
        })
    );
  }

  private _parseQueryResponse(
    queryResponseDto: QueryResponseDto,
    testDriveDto: TestDriveQueryDto,
  ): EitherIO<UnknownDomainError, Partial<TestDriveQueryDto>> {
    const startTime: DateTime = this._dateTimeUtil.fromIso(testDriveDto.createdAt);
    const executionTime: number = this._dateTimeUtil.now().diff(startTime) / 1000;

    return EitherIO.from(UnknownDomainError.toFn(), () => {
      const testDriveResult: Partial<TestDriveQueryDto> =
        this._queryRequestService.parseTestDriveResponse(queryResponseDto);
      return { ...testDriveResult, executionTime };
    }).catch(async () => {
      return Either.right({
        id: queryResponseDto.queryRef,
        queryStatus: TestDriveQueryStatus.FAILURE,
        status: false,
        executionTime,
        responseJson: null,
      });
    });
  }
}
