import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  DownloadUserLogsDomain,
  DownloadUserLogsIO,
  UserLogReportFormat,
} from 'src/domain/core/user/download-user-logs.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { UserUtilizationLogService } from 'src/domain/_layer/infrastructure/service/user-utilization-log.service';
import { UserLogDto } from 'src/domain/_layer/presentation/dto/user-log-output.dto';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';
import { SheetUtil } from 'src/infrastructure/util/sheet.util';

@Injectable()
export class DownloadUserLogsUseCase implements DownloadUserLogsDomain {
  constructor(
    private readonly _userUtilizationLogService: UserUtilizationLogService,
    private readonly _sheetUtil: SheetUtil,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {}

  getAll(userId: string): DownloadUserLogsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._userUtilizationLogService.getAllUserLogs(userId),
    )
      .map(
        (logs: ReadonlyArray<UserLogDto>): ReadonlyArray<UserLogReportFormat> =>
          logs.map((log: UserLogDto) => ({
            ID: log.id,
            Ação: log.actionName,
            Descrição: log.actionDescription,
            Token: log.token,
            Data: this._dateTimeUtil.fromIso(log.createdAt).getBrazilianDateFormat(),
          })),
      )
      .map(
        // eslint-disable-next-line functional/prefer-readonly-type
        (logs: Array<UserLogReportFormat>) => this._sheetUtil.generateBufferFromDataJson(logs),
      );
  }
}
