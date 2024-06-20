import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { DetailedPriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { QueryComposerRepository } from 'src/domain/_layer/infrastructure/repository/query-composer.repository';
import { GetUserAllQueryPricesIO } from 'src/domain/support/billing/get-user-price-table.domain';
import { QueryPriceTableEntity, QueryPriceTableTemplateItem } from '../../../domain/_entity/query-price-table.entity';
import {
  NoCreditsAddedDomainError,
  NoPriceTableFoundDomainError,
  NoUserFoundDomainError,
  ProductUnavailableToUserDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { BalanceDto } from '../../../domain/_layer/data/dto/balance.dto';
import { BillingDto } from '../../../domain/_layer/data/dto/billing.dto';
import { BalanceRepository } from '../../../domain/_layer/infrastructure/repository/balance.repository';
import { BillingRepository } from '../../../domain/_layer/infrastructure/repository/billing.repository';
import { PriceTableRepository } from '../../../domain/_layer/infrastructure/repository/price-table.repository';
import { AddUserCreditsIO, AddUserCreditsResult } from '../../../domain/support/billing/add-user-credits.domain';
import { DeductUserCreditsResult } from '../../../domain/support/billing/deduct-user-credits.domain';
import { GetQueryPriceIO } from '../../../domain/support/billing/get-query-price.domain';
import { GetUserCurrentBalanceIO } from '../../../domain/support/billing/get-user-current-balance.domain';
import { Currency, CurrencyUtil } from '../../../infrastructure/util/currency.util';

export type GetUserBillingIO = EitherIO<NoUserFoundDomainError, BillingDto>;

type UpdateBillingBalanceIO = EitherIO<
  UnknownDomainError | NoUserFoundDomainError | NoCreditsAddedDomainError,
  BillingDto
>;

@Injectable()
export class BillingHelper {
  constructor(
    private readonly _balanceRepository: BalanceRepository,
    private readonly _billingRepository: BillingRepository,
    private readonly _priceTableRepository: PriceTableRepository,
    private readonly _queryComposerRepository: QueryComposerRepository,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  private _getQueryTemplateItem(
    queryCode: number,
    template?: ReadonlyArray<QueryPriceTableTemplateItem>,
  ): QueryPriceTableTemplateItem | null {
    if (!template || !Array.isArray(template)) return null;
    return template.find((templateItem: QueryPriceTableTemplateItem) => templateItem.queryCode === queryCode) || null;
  }

  private _mapRepositoryResponseToDomainResponse(
    queryCode: number,
    maybePriceTable: QueryPriceTableEntity | null,
  ): GetQueryPriceIO {
    if (!maybePriceTable) return EitherIO.raise(NoPriceTableFoundDomainError.toFn());
    const maybeQueryPrice: QueryPriceTableTemplateItem | null = this._getQueryTemplateItem(
      queryCode,
      maybePriceTable.template,
    );
    return maybeQueryPrice
      ? EitherIO.of(UnknownDomainError.toFn(), maybeQueryPrice)
      : EitherIO.raise(ProductUnavailableToUserDomainError.toFn());
  }

  private async _appendQueryComposerName(dto: QueryPriceTableTemplateItem): Promise<QueryPriceTableTemplateItem> {
    const composer: QueryComposerDto = await this._queryComposerRepository.getByQueryCode(dto.queryCode);
    return { ...dto, queryName: composer.name };
  }

  private _addNewBalance(balance: Partial<BalanceDto>, transactionRef: unknown): AddUserCreditsIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._balanceRepository.insert(balance, transactionRef),
    ).filter(UnknownDomainError.toFn(), (maybeBalance: BalanceDto | null) => !!maybeBalance);
  }

  updateAccountFunds(userId: string, valueToSumInCents: number, transactionRef?: unknown): UpdateBillingBalanceIO {
    return EitherIO.from(NoCreditsAddedDomainError.toFn(), () =>
      this._billingRepository.updateAccountFunds(userId, valueToSumInCents, transactionRef),
    ).filter(NoCreditsAddedDomainError.toFn(), Boolean);
  }

  getUserCurrentBalance(userId: string): GetUserCurrentBalanceIO {
    return EitherIO.of(UnknownDomainError.toFn(), userId)
      .map((id: string) => this._balanceRepository.getUserLastBalance(id))
      .map((balance: BalanceDto) => {
        if (balance) return balance;
        return this._balanceRepository.insert({ userId });
      });
  }

  getDefaultQueryPrice(queryCode: number): GetQueryPriceIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._priceTableRepository.getDefaultPriceTable())
      .flatMap((maybePriceTable: QueryPriceTableEntity | null) => {
        return this._mapRepositoryResponseToDomainResponse(queryCode, maybePriceTable);
      })
      .map(this._appendQueryComposerName.bind(this));
  }

  getUserQueryPrice(queryCode: number, userId: string): GetQueryPriceIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._priceTableRepository.getUserPriceTable(userId))
      .flatMap((maybePriceTable: QueryPriceTableEntity | null) => {
        return this._mapRepositoryResponseToDomainResponse(queryCode, maybePriceTable);
      })
      .map(this._appendQueryComposerName.bind(this));
  }

  getUserAllQueryPrices(userId?: string): GetUserAllQueryPricesIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._priceTableRepository.getDetailedUserPriceTable(userId),
    ).map((maybePricesTable: DetailedPriceTableDto | null) => maybePricesTable.template);
  }

  getUserBilling(userId: string): GetUserBillingIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._billingRepository.getByUser(userId)).filter(
      NoUserFoundDomainError.toFn(),
      (maybeBilling: BillingDto | null) => !!(maybeBilling && maybeBilling.id),
    );
  }

  updateUserCredits(
    transactionRef: unknown,
    valueToSumInCents: number,
    userId: string,
    assignerId?: string,
    consumptionItemId?: string,
    paymentId?: string,
  ): Promise<AddUserCreditsResult | DeductUserCreditsResult> {
    return this.updateAccountFunds(userId, valueToSumInCents, transactionRef)
      .zip(this.getUserCurrentBalance(userId), (billingDto: BillingDto, balanceDto: BalanceDto) => ({
        userId,
        assignerId,
        consumptionItemId,
        paymentId,
        attributedValueCents: Math.max(valueToSumInCents, 0),
        lastBalanceCents: balanceDto.currentBalanceCents,
        currentBalanceCents: this._currencyUtil
          .numToCurrency(balanceDto.currentBalanceCents, Currency.CENTS_PRECISION)
          .addValue(valueToSumInCents, Currency.CENTS_PRECISION)
          .toInt(),
      }))
      .flatMap((nextBalanceDto: Partial<BalanceDto>) => this._addNewBalance(nextBalanceDto, transactionRef))
      .safeRun();
  }
}
