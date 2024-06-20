import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { BalanceEntity } from '../../_entity/balance.entity';
import {
  CreditsAlreadyAddedDomainError,
  NoCreditsAddedDomainError,
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';

export type AddUserCreditsDomainErrors =
  | UnknownDomainError
  | NoUserFoundDomainError
  | NoPaymentFoundDomainError
  | NoCreditsAddedDomainError
  | CreditsAlreadyAddedDomainError;

export type AddUserCreditsResult = Either<AddUserCreditsDomainErrors, BalanceEntity>;

export type AddUserCreditsIO = EitherIO<AddUserCreditsDomainErrors, BalanceEntity>;

export abstract class AddUserCreditsDomain {
  abstract addUserCreditsFromPayment(paymentId: string): AddUserCreditsIO;

  abstract addUserCredits(valueInCents: number, userId: string, assignerId?: string): AddUserCreditsIO;
}
