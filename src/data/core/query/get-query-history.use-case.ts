import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GetQueryHistoryDomain, GetQueryHistoryIO } from 'src/domain/core/query/get-query-history.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { QueryHistoryItemDto } from '../../../domain/_layer/data/dto/query-history-item.dto';

@Injectable()
export class GetQueryHistoryUseCase implements GetQueryHistoryDomain {
  constructor(private readonly _queryRepository: QueryRepository) {}

  private static _parseArrayQueryDtoToQueryHistoryItem(
    queries: ReadonlyArray<QueryDto>,
  ): ReadonlyArray<QueryHistoryItemDto> {
    return queries.map((queryDto: QueryDto) => {
      return {
        id: queryDto.id,
        code: queryDto.queryCode,
        name: queryDto.refClass,
        status: queryDto.status,
        documentQuery: queryDto.documentQuery,
        documentType: queryDto.documentType,
        executionTime: queryDto.executionTime,
        createdAt: queryDto.createdAt,
      };
    });
  }

  getQueryHistory(userId: string, perPage: number, page: number, search: string): GetQueryHistoryIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._queryRepository.getTestDriveAndRegularQueriesByUserId(userId, perPage, page, search),
    ).map((pagination: PaginationOf<QueryDto>) => ({
      ...pagination,
      items: GetQueryHistoryUseCase._parseArrayQueryDtoToQueryHistoryItem(pagination.items),
    }));
  }
}
