import { Injectable } from '@nestjs/common';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';
import { UserLogDto } from 'src/domain/_layer/presentation/dto/user-log-output.dto';
import { UserUtilizationLogService } from 'src/domain/_layer/infrastructure/service/user-utilization-log.service';

@Injectable()
export class UserUtilizationLogMockService implements UserUtilizationLogService {
  sendLog(_userId: string, _actionName: string, _actionDescription: unknown, _actionId: string): void {
    throw new Error('Method not implemented.');
  }

  async getUserLogsPaginated(_userId: string, _page: number, limit: number): Promise<PaginationOf<UserLogDto>> {
    return {
      totalPages: 1,
      amountInThisPage: limit,
      currentPage: 1,
      itemsPerPage: limit,
      nextPage: 1,
      previousPage: 1,
      items: [...new Array(limit)].map(UserUtilizationLogMockService._genUserLogDto),
      count: limit,
    };
  }

  async getAllUserLogs(_userId: string): Promise<ReadonlyArray<UserLogDto>> {
    return [...new Array(3)].map(UserUtilizationLogMockService._genUserLogDto);
  }

  private static _genUserLogDto(): UserLogDto {
    return {
      id: TestUtil.generateId(),
      token: 'token',
      actionDescription: 'description',
      actionName: 'name',
      createdAt: new Date().toISOString(),
    };
  }
}
