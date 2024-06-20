import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  GetPaginatedUserLogsDomain,
  GetPaginatedUserLogsIO,
} from 'src/domain/core/user/get-paginated-user-logs.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { UserUtilizationLogService } from 'src/domain/_layer/infrastructure/service/user-utilization-log.service';

@Injectable()
export class GetPaginatedUserLogsUseCase implements GetPaginatedUserLogsDomain {
  constructor(private readonly _userUtilizationLogService: UserUtilizationLogService) {}

  getPaginated(userId: string, page: number, limit: number): GetPaginatedUserLogsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._userUtilizationLogService.getUserLogsPaginated(userId, page, limit),
    );
  }
}
