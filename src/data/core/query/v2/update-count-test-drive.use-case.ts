import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TotalTestDriveDto } from 'src/domain/_layer/data/dto/total-test-drive.dto';
import { TestDriveQueryRepository } from 'src/domain/_layer/infrastructure/repository/test-drive-query.repository';
import { TotalTestDriveRepository } from 'src/domain/_layer/infrastructure/repository/total-test-drive.repository';
import {
  UpdateCountTestDriveDomain,
  UpdateCountTestDriveIO,
} from 'src/domain/core/query/v2/update-count-test-drive.domain';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

@Injectable()
export class UpdateCountTestDriveUseCase implements UpdateCountTestDriveDomain {
  constructor(
    private readonly _testDriveQueryRepository: TestDriveQueryRepository,
    private readonly _totalTestDriveRepository: TotalTestDriveRepository,
    private readonly _envService: EnvService,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {}

  execute(token: string): UpdateCountTestDriveIO {
    return EitherIO.of(UnknownDomainError.toFn(), token)
      .filter(UnknownDomainError.toFn(), this._isValidToken())
      .map(this._insertNewTotalCount());
  }

  private _isValidToken() {
    return (token: string): boolean => token === this._envService.get('SCHEDULER_TOKEN');
  }

  private _insertNewTotalCount() {
    return async (): Promise<TotalTestDriveDto> => {
      const totalTestDrive: TotalTestDriveDto = await this._totalTestDriveRepository.getCurrent();
      const dayToday: number = this._dateTimeUtil.now().getDayOfMonth();
      const updatedDay: number = this._dateTimeUtil.fromDate(totalTestDrive.createdAt).getDayOfMonth();

      if (dayToday === updatedDay) return totalTestDrive;
      const totalOfTestDrive: number = await this._testDriveQueryRepository.countByDay();
      return await this._totalTestDriveRepository.insert({
        total: totalTestDrive.total + totalOfTestDrive,
        createdAt: new Date(),
      });
    };
  }
}
