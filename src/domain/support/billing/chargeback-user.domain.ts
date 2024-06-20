import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { BillingEntity } from '../../_entity/billing.entity';
import { NoBalanceFoundDomainError, NoUserFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type ChargebackUserDomainErrors = UnknownDomainError | NoUserFoundDomainError | NoBalanceFoundDomainError;

export type ChargebackUserResult = Either<ChargebackUserDomainErrors, BillingEntity>;

export type ChargebackUserIO = EitherIO<ChargebackUserDomainErrors, BillingEntity>;

export abstract class ChargebackUserDomain {
  readonly chargebackUser: (balanceId: string) => ChargebackUserIO;
}
