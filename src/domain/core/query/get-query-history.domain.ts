import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { QueryHistoryItemDto } from '../../_layer/data/dto/query-history-item.dto';

export type GetQueryHistoryDomainErrors = UnknownDomainError;

export type GetQueryHistory = Either<GetQueryHistoryDomainErrors, PaginationOf<QueryHistoryItemDto>>;

export type GetQueryHistoryIO = EitherIO<GetQueryHistoryDomainErrors, PaginationOf<QueryHistoryItemDto>>;

export abstract class GetQueryHistoryDomain {
  readonly getQueryHistory: (userId: string, perPage: number, page: number, search: string) => GetQueryHistoryIO;
}
