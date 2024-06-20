import { Injectable } from '@nestjs/common';
import { GetQueryDomain, GetQueryIO } from '../../../domain/core/query/get-query.domain';
import { QueryHelper } from './query.helper';

@Injectable()
export class GetQueryUseCase implements GetQueryDomain {
  constructor(private readonly _queryHelper: QueryHelper) {}

  getQuery(queryId: string): GetQueryIO {
    return this._queryHelper.getQuery(queryId);
  }
}
