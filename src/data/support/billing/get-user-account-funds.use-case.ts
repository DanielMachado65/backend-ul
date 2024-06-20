import { Injectable } from '@nestjs/common';
import {
  GetUserAccountFundsDomain,
  GetUserCurrentAccountFundsIO,
} from 'src/domain/support/billing/get-user-account-funds.domain';
import { BillingEntity } from 'src/domain/_entity/billing.entity';
import { BillingHelper } from './billing.helper';

@Injectable()
export class GetUserAccountFundsUseCase implements GetUserAccountFundsDomain {
  constructor(private readonly _billingHelper: BillingHelper) {}

  getUserAccountFunds(userId: string): GetUserCurrentAccountFundsIO {
    return this._billingHelper.getUserBilling(userId).map((billing: BillingEntity) => billing.accountFundsCents);
  }
}
