import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  InsufficientCreditsDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { BillingDto } from '../../../domain/_layer/data/dto/billing.dto';
import { BillingRepository } from '../../../domain/_layer/infrastructure/repository/billing.repository';
import { AddUserCreditsResult } from '../../../domain/support/billing/add-user-credits.domain';
import {
  DeductUserCreditsDomain,
  DeductUserCreditsIO,
  DeductUserCreditsResult,
} from '../../../domain/support/billing/deduct-user-credits.domain';
import { TransactionHelper } from '../../../infrastructure/repository/transaction.helper';
import { Currency, CurrencyUtil } from '../../../infrastructure/util/currency.util';
import { BillingHelper } from './billing.helper';

@Injectable()
export class DeductUserCreditsUseCase implements DeductUserCreditsDomain {
  constructor(
    private readonly _transactionHelper: TransactionHelper,
    private readonly _billingHelper: BillingHelper,
    private readonly _billingRepository: BillingRepository,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  deductUserCredits(
    valueInCents: number,
    userId: string,
    assignerId?: string,
    consumptionItemId?: string,
  ): DeductUserCreditsIO {
    return EitherIO.of(UnknownDomainError.toFn(), userId)
      .map((id: string) => this._billingRepository.getByUser(id))
      .filter(NoUserFoundDomainError.toFn(), (maybeBillingDto: BillingDto | null) => !!maybeBillingDto)
      .map((billingDto: BillingDto) => {
        return this._currencyUtil
          .numToCurrency(billingDto.accountFundsCents, Currency.CENTS_PRECISION)
          .minusValue(valueInCents, Currency.CENTS_PRECISION);
      })
      .filter(InsufficientCreditsDomainError.toFn(), (nextBalanceAmount: Currency) => !nextBalanceAmount.isNegative())
      .flatMap(() => {
        const promise: Promise<AddUserCreditsResult | DeductUserCreditsResult> =
          this._transactionHelper.withTransaction((transactionRef: unknown) => {
            const valueToDeductInCents: number = this._currencyUtil
              .numToCurrency(valueInCents, Currency.CENTS_PRECISION)
              .multiply(-1)
              .toInt();
            return this._billingHelper.updateUserCredits(
              transactionRef,
              valueToDeductInCents,
              userId,
              assignerId,
              consumptionItemId,
              null,
            );
          });
        return EitherIO.fromEither(UnknownDomainError.toFn(), () => promise);
      });
  }
}
