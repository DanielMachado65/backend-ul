import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TotalTestDriveDto } from 'src/domain/_layer/data/dto/total-test-drive.dto';
import { TotalTestDriveRepository } from 'src/domain/_layer/infrastructure/repository/total-test-drive.repository';
import {
  GetTotalTestsDrivesDomain,
  GetTotalTestsDrivesIO,
} from 'src/domain/core/query/v2/get-total-tests-drives.domain';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

@Injectable()
export class GetTotalTestsDrivesUseCase implements GetTotalTestsDrivesDomain {
  private static readonly TOTAL_CACHE: Partial<TotalTestDriveDto> = { total: 0, createdAt: null };

  constructor(
    private readonly _totalTestDriveRepository: TotalTestDriveRepository,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {}

  execute(): GetTotalTestsDrivesIO {
    return EitherIO.of(UnknownDomainError.toFn(), GetTotalTestsDrivesUseCase.TOTAL_CACHE).map(
      async (cache: TotalTestDriveDto) => {
        if (GetTotalTestsDrivesUseCase.TOTAL_CACHE.createdAt === null || this._diffDays()) {
          const result: TotalTestDriveDto = await this._totalTestDriveRepository.getCurrent();
          return this._setCache(result);
        }

        return cache;
      },
    );
  }

  private _setCache(dto: TotalTestDriveDto): TotalTestDriveDto {
    GetTotalTestsDrivesUseCase.TOTAL_CACHE.total = dto.total;
    GetTotalTestsDrivesUseCase.TOTAL_CACHE.createdAt = dto.createdAt;

    return dto;
  }

  private _diffDays(): boolean {
    const dayToday: number = this._dateTimeUtil.now().getDayOfMonth();

    const dayCache: number = this._dateTimeUtil
      .fromDate(GetTotalTestsDrivesUseCase.TOTAL_CACHE.createdAt)
      .getDayOfMonth();

    return dayToday > dayCache;
  }
}
