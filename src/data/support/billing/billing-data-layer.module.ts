import { Module, Provider } from '@nestjs/common';
import { GetPriceTableProductsUseCase } from 'src/data/support/billing/get-price-table-products.use-case';
import { GetUserAllQueryPricesUseCase } from 'src/data/support/billing/get-user-all-query-prices.use-case';
import { GetUserPaymentHistoryDomain } from 'src/domain/core/query/get-user-payment-history.domain';
import { AddCreditCardDomain } from 'src/domain/support/billing/add-credit-card.domain';
import { CancelUserSubscriptionDomain } from 'src/domain/support/billing/cancel-user-subscription.domain';
import { ChangeSubscriptionCreditCardDomain } from 'src/domain/support/billing/change-subscription-credit-card.domain';
import { GetPriceTableProductsDomain } from 'src/domain/support/billing/get-price-table-products.domain';
import { GetSubscriptionRelatedDataDomain } from 'src/domain/support/billing/get-subscription-related-data.domain';
import { GetUserAccountFundsDomain } from 'src/domain/support/billing/get-user-account-funds.domain';
import { GetUserAllQueryPricesDomain } from 'src/domain/support/billing/get-user-price-table.domain';
import { GiveCouponForNewUserDomain } from 'src/domain/support/billing/give-coupon-for-new-users';
import { ListCreditCardsDomain } from 'src/domain/support/billing/list-credit-cards.domain';
import { ListUserSubscriptionsDomain } from 'src/domain/support/billing/list-user-subscriptions.domain';
import { RemoveCreditCardDomain } from 'src/domain/support/billing/remove-credit-card.domain';
import { AddUserCreditsDomain } from '../../../domain/support/billing/add-user-credits.domain';
import { AssociateQueryAndConsumptionDomain } from '../../../domain/support/billing/associate-query-and-consumption.domain';
import { ChargeUserForQueryDomain } from '../../../domain/support/billing/charge-user-for-query.domain';
import { ChargebackUserDomain } from '../../../domain/support/billing/chargeback-user.domain';
import { DeductUserCreditsDomain } from '../../../domain/support/billing/deduct-user-credits.domain';
import { GetQueryPriceDomain } from '../../../domain/support/billing/get-query-price.domain';
import { GetUserCurrentBalanceDomain } from '../../../domain/support/billing/get-user-current-balance.domain';
import { AddCreditCardUseCase } from './add-credit-card.use-case';
import { AddUserCreditsUseCase } from './add-user-credits.use-case';
import { AssociateQueryAndConsumptionUseCase } from './associate-query-and-consumption.use-case';
import { BillingHelper } from './billing.helper';
import { CancelUserSubscriptionUseCase } from './cancel-user-subscription.use-case';
import { ChangeSubscriptionCreditCardUseCase } from './change-subscription-credit-card.use-case';
import { ChargeUserForQueryUseCase } from './charge-user-for-query.use-case';
import { ChargebackUserUseCase } from './chargeback-user.use-case';
import { DeductUserCreditsUseCase } from './deduct-user-credits.use-case';
import { GetQueryPriceUseCase } from './get-query-price.use-case';
import { GetSubscriptionRelatedDataUseCase } from './get-subscription-related-data.use-case';
import { GetUserAccountFundsUseCase } from './get-user-account-funds.use-case';
import { GetUserCurrentBalanceUseCase } from './get-user-current-balance.use-case';
import { GetUserPaymentHistoryUseCase } from './get-user-payment-history.use-case';
import { GiveCouponForNewUserUseCase } from './give-coupon-for-new-user.use-case';
import { ListCreditCardsUseCase } from './list-credit-cards.use-case';
import { ListUserSubscriptionsUseCase } from './list-user-subscriptions.use-case';
import { RemoveCreditCardUseCase } from './remove-credit-card.use-case';
import { SyncWithExternalSubscriptionDomain } from 'src/domain/support/billing/sync-with-external-subscription.domain';
import { SyncWithExternalSubscriptionUseCase } from './sync-with-external-subscription.use-case';
import { SharedModule } from 'src/data/shared/shared.module';
import { GetSubscriptionRelatedDataHelper } from './get-subscription-related-data.helper';
import { GetPlansDomain } from 'src/domain/support/billing/get-plans.domain';
import { GetPlansUseCase } from './get-plans.use-case';

const providers: ReadonlyArray<Provider> = [
  { provide: AddCreditCardDomain, useClass: AddCreditCardUseCase },
  { provide: AddUserCreditsDomain, useClass: AddUserCreditsUseCase },
  { provide: AssociateQueryAndConsumptionDomain, useClass: AssociateQueryAndConsumptionUseCase },
  { provide: CancelUserSubscriptionDomain, useClass: CancelUserSubscriptionUseCase },
  { provide: ChangeSubscriptionCreditCardDomain, useClass: ChangeSubscriptionCreditCardUseCase },
  { provide: ChargebackUserDomain, useClass: ChargebackUserUseCase },
  { provide: ChargeUserForQueryDomain, useClass: ChargeUserForQueryUseCase },
  { provide: DeductUserCreditsDomain, useClass: DeductUserCreditsUseCase },
  { provide: GetQueryPriceDomain, useClass: GetQueryPriceUseCase },
  { provide: GetSubscriptionRelatedDataDomain, useClass: GetSubscriptionRelatedDataUseCase },
  { provide: GetUserAccountFundsDomain, useClass: GetUserAccountFundsUseCase },
  { provide: GetUserAllQueryPricesDomain, useClass: GetUserAllQueryPricesUseCase },
  { provide: GetUserCurrentBalanceDomain, useClass: GetUserCurrentBalanceUseCase },
  { provide: GetUserPaymentHistoryDomain, useClass: GetUserPaymentHistoryUseCase },
  { provide: GiveCouponForNewUserDomain, useClass: GiveCouponForNewUserUseCase },
  { provide: ListCreditCardsDomain, useClass: ListCreditCardsUseCase },
  { provide: ListUserSubscriptionsDomain, useClass: ListUserSubscriptionsUseCase },
  { provide: RemoveCreditCardDomain, useClass: RemoveCreditCardUseCase },
  { provide: GetPriceTableProductsDomain, useClass: GetPriceTableProductsUseCase },
  { provide: SyncWithExternalSubscriptionDomain, useClass: SyncWithExternalSubscriptionUseCase },
  { provide: GetPlansDomain, useClass: GetPlansUseCase },
  GetSubscriptionRelatedDataHelper,
];

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [BillingHelper, ...providers],
  exports: [...providers],
})
export class BillingDataLayerModule {}
