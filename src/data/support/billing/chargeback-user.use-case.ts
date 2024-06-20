import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  NoBalanceFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { BalanceDto } from '../../../domain/_layer/data/dto/balance.dto';
import { BillingDto } from '../../../domain/_layer/data/dto/billing.dto';
import { BalanceRepository } from '../../../domain/_layer/infrastructure/repository/balance.repository';
import { ConsumptionStatementRepository } from '../../../domain/_layer/infrastructure/repository/consumption-statement.repository';
import { ChargebackUserDomain, ChargebackUserIO } from '../../../domain/support/billing/chargeback-user.domain';
import { Currency, CurrencyUtil } from '../../../infrastructure/util/currency.util';
import { BillingHelper } from './billing.helper';

type UpdateBillingBalanceResult = Either<UnknownDomainError | NoUserFoundDomainError, BillingDto>;

@Injectable()
export class ChargebackUserUseCase implements ChargebackUserDomain {
  constructor(
    private readonly _billingHelper: BillingHelper,
    private readonly _balanceRepository: BalanceRepository,
    private readonly _consumptionRepository: ConsumptionStatementRepository,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  private async _executeChargebackOperation(balanceDto: BalanceDto): Promise<UpdateBillingBalanceResult> {
    const valueToSumInCents: number = this._currencyUtil
      .numToCurrency(balanceDto.lastBalanceCents, Currency.CENTS_PRECISION)
      .minusValue(balanceDto.currentBalanceCents, Currency.CENTS_PRECISION)
      .toInt();
    return this._billingHelper
      .updateAccountFunds(balanceDto.userId, valueToSumInCents)
      .tap(() => this._balanceRepository.removeById(balanceDto.id))
      .tap(() => this._consumptionRepository.removeById(balanceDto.consumptionItemId))
      .safeRun();
  }

  chargebackUser(balanceId: string): ChargebackUserIO {
    return EitherIO.of(UnknownDomainError.toFn(), balanceId)
      .map((id: string) => this._balanceRepository.getById(id))
      .filter(NoBalanceFoundDomainError.toFn(), (balanceDto: BalanceDto | null) => !!balanceDto)
      .flatMap((balanceDto: BalanceDto) => {
        const promise: Promise<UpdateBillingBalanceResult> = this._executeChargebackOperation(balanceDto);
        return EitherIO.fromEither(UnknownDomainError.toFn(), () => promise);
      });
  }
}
