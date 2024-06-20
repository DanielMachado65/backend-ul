import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { BalanceEntity } from '../../_entity/balance.entity';
import {
  CantIssueInvoiceDomainError,
  InactiveBillingDomainError,
  InsufficientCreditsDomainError,
  NoPriceTableFoundDomainError,
  NoUserFoundDomainError,
  ProductUnavailableToUserDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type ChargeUserDomainErrors =
  | UnknownDomainError
  | NoPriceTableFoundDomainError
  | NoUserFoundDomainError
  | InactiveBillingDomainError
  | ProductUnavailableToUserDomainError
  | InsufficientCreditsDomainError
  | CantIssueInvoiceDomainError;

export type ChargeUserResult = Either<ChargeUserDomainErrors, BalanceEntity>;

export type ChargeUserIO = EitherIO<ChargeUserDomainErrors, BalanceEntity>;

export abstract class ChargeUserForQueryDomain {
  readonly chargeUserForQuery: (userId: string, queryCode: number) => ChargeUserIO;
}
