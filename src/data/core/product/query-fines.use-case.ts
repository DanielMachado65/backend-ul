import { Injectable } from '@nestjs/common';

import { QueryFinesDomain, QueryFinesIO } from 'src/domain/core/product/query-fines.domain';
import { QueryFinesHelper } from './helpers/query-fines.helper';
import { MyCarsQueryHelper } from './my-cars-query.helper';

@Injectable()
export class QueryFinesUseCase implements QueryFinesDomain {
  constructor(
    private readonly _myCarsQueryHelper: MyCarsQueryHelper,
    private readonly _queryFinesHelper: QueryFinesHelper,
  ) {}

  execute(userId: string, carId: string): QueryFinesIO {
    return this._myCarsQueryHelper
      .getCar(userId, carId)
      .map(this._myCarsQueryHelper.requestQuery(QueryFinesHelper.QUERY_TEMPLATE))
      .map(this._myCarsQueryHelper.getResponse(45_000))
      .map(this._queryFinesHelper.parseResponse());
  }
}
