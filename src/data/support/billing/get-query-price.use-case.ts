import { Injectable } from '@nestjs/common';
import { GetQueryPriceDomain, GetQueryPriceIO } from '../../../domain/support/billing/get-query-price.domain';
import { BillingHelper } from './billing.helper';

@Injectable()
export class GetQueryPriceUseCase implements GetQueryPriceDomain {
  constructor(private readonly _billingHelper: BillingHelper) {}

  getQueryPrice(queryCode: number, userId?: string): GetQueryPriceIO {
    return userId
      ? this._billingHelper.getUserQueryPrice(queryCode, userId)
      : this._billingHelper.getDefaultQueryPrice(queryCode);
  }
}
