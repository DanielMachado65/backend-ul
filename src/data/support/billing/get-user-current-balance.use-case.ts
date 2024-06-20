import { Injectable } from '@nestjs/common';
import { BillingHelper } from './billing.helper';
import {
  GetUserCurrentBalanceDomain,
  GetUserCurrentBalanceIO,
} from '../../../domain/support/billing/get-user-current-balance.domain';

@Injectable()
export class GetUserCurrentBalanceUseCase implements GetUserCurrentBalanceDomain {
  constructor(private readonly _billingHelper: BillingHelper) {}

  getUserCurrentBalance(userId: string): GetUserCurrentBalanceIO {
    return this._billingHelper.getUserCurrentBalance(userId);
  }
}
