import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { BalanceEntity } from '../../_entity/balance.entity';
import {
  InsufficientCreditsDomainError,
  NoCreditsAddedDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type DeductUserCreditsDomainErrors =
  | UnknownDomainError
  | NoUserFoundDomainError
  | NoCreditsAddedDomainError
  | InsufficientCreditsDomainError;

export type DeductUserCreditsResult = Either<DeductUserCreditsDomainErrors, BalanceEntity>;

export type DeductUserCreditsIO = EitherIO<DeductUserCreditsDomainErrors, BalanceEntity>;

export abstract class DeductUserCreditsDomain {
  readonly deductUserCredits: (valueInCents: number, userId: string, assignerId?: string) => DeductUserCreditsIO;
}
