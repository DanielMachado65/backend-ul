import { PaginationOf } from '../../data/dto/pagination.dto';
import { UserLogDto } from '../../presentation/dto/user-log-output.dto';

export abstract class UserUtilizationLogService {
  abstract getUserLogsPaginated(userId: string, page: number, limit: number): Promise<PaginationOf<UserLogDto>>;

  abstract getAllUserLogs(userId: string): Promise<ReadonlyArray<UserLogDto>>;

  abstract sendLog(userId: string, actionName: string, actionDescription: unknown, actionId: string): void;
}
