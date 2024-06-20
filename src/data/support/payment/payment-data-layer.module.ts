import { Module, Provider } from '@nestjs/common';
import { AutomatePaymentDomain } from 'src/domain/support/payment/automate-payment.domain';
import { CreateInternalPaymentDomain } from 'src/domain/support/payment/create-internal-payment.domain';
import { GetPaymentDomain } from 'src/domain/support/payment/get-payment.domain';
import { PaymentWithBankSlipLegacyDomain } from 'src/domain/support/payment/payment-with-bank-slip-legacy.domain';
import { PaymentWithCreditCardLegacyDomain } from 'src/domain/support/payment/payment-with-credit-card-legacy.domain';
import { PaymentWithPixLegacyDomain } from 'src/domain/support/payment/payment-with-pix-legacy.domain';
import { SyncWithExternalPaymentDomain } from 'src/domain/support/payment/sync-with-external-payment.domain';
import { ApplyCouponDomain } from '../../../domain/support/payment/apply-coupon.domain';
import { CreateCreditCardTokenDomain } from '../../../domain/support/payment/create-credit-card-token.domain';
import { CreateNfeDomain } from '../../../domain/support/payment/create-nfe.domain';
import { GetPaymentStatusDomain } from '../../../domain/support/payment/get-payment-status.domain';
import { PaymentWithBankSlipDomain } from '../../../domain/support/payment/payment-with-bank-slip.domain';
import { PaymentWithCreditCardDomain } from '../../../domain/support/payment/payment-with-credit-card.domain';
import { PaymentWithPixDomain } from '../../../domain/support/payment/payment-with-pix.domain';
import { ApplyCouponUseCase } from './apply-coupon.use-case';
import { AutomatePaymentUseCase } from './automate-payment.use-case';
import { CreateCreditCardTokenUseCase } from './create-credit-card-token.use-case';
import { CreateInternalPaymentUseCase } from './create-internal-payment.use-case';
import { CreateNfeUseCase } from './create-nfe.use-case';
import { GetPaymentStatusUseCase } from './get-payment-status.use-case';
import { GetPaymentUseCase } from './get-payment.use-case';
import { PaymentWithBankSlipLegacyUseCase } from './payment-with-bank-slip-legacy.use-case';
import { PaymentWithBankSlipUseCase } from './payment-with-bank-slip.use-case';
import { PaymentWithCreditCardLegacyUseCase } from './payment-with-credit-card-legacy.use-case';
import { PaymentWithCreditCardUseCase } from './payment-with-credit-card.use-case';
import { PaymentWithPixLegacyUseCase } from './payment-with-pix-legacy.use-case';
import { PaymentWithPixUseCase } from './payment-with-pix.use-case';
import { PaymentHelper } from './payment.helper';
import { SyncWithExternalPaymentUseCase } from './sync-with-external-payment.use-case';
import { CouponValidationHelper } from './coupon-validation-helper';

const internalProviders: ReadonlyArray<Provider> = [
  PaymentHelper,
  CouponValidationHelper,
  { provide: ApplyCouponDomain, useClass: ApplyCouponUseCase },
  { provide: CreateInternalPaymentDomain, useClass: CreateInternalPaymentUseCase },
];

const externalProviders: ReadonlyArray<Provider> = [
  { provide: CreateCreditCardTokenDomain, useClass: CreateCreditCardTokenUseCase },
  { provide: CreateNfeDomain, useClass: CreateNfeUseCase },
  { provide: GetPaymentDomain, useClass: GetPaymentUseCase },
  { provide: GetPaymentStatusDomain, useClass: GetPaymentStatusUseCase },
  { provide: PaymentWithBankSlipDomain, useClass: PaymentWithBankSlipUseCase },
  { provide: PaymentWithBankSlipLegacyDomain, useClass: PaymentWithBankSlipLegacyUseCase },
  { provide: PaymentWithCreditCardDomain, useClass: PaymentWithCreditCardUseCase },
  { provide: PaymentWithCreditCardLegacyDomain, useClass: PaymentWithCreditCardLegacyUseCase },
  { provide: PaymentWithPixDomain, useClass: PaymentWithPixUseCase },
  { provide: PaymentWithPixLegacyDomain, useClass: PaymentWithPixLegacyUseCase },
  { provide: SyncWithExternalPaymentDomain, useClass: SyncWithExternalPaymentUseCase },
  { provide: AutomatePaymentDomain, useClass: AutomatePaymentUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...internalProviders, ...externalProviders],
  exports: [...externalProviders],
})
export class PaymentDataLayerModule {}
