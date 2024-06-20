import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { UserLogDto } from 'src/domain/_layer/presentation/dto/user-log-output.dto';

export type GetPaginatedUserLogsErrors = ProviderUnavailableDomainError;

export type GetPaginatedUserLogsResult = Either<GetPaginatedUserLogsErrors, PaginationOf<UserLogDto>>;

export type GetPaginatedUserLogsIO = EitherIO<GetPaginatedUserLogsErrors, PaginationOf<UserLogDto>>;

export abstract class GetPaginatedUserLogsDomain {
  abstract getPaginated(userId: string, page: number, limit: number): GetPaginatedUserLogsIO;
}
