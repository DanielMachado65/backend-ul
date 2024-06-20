import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoUserFoundDomainError, ProviderUnavailableDomainError, UnknownDomainError } from '../../_entity/result.error';
import { TransactionDebitWithdrawalBodyInputDto } from 'src/domain/_layer/presentation/dto/transaction-debit-withdrawal-input.dto';
import { TransactionDebitWithdrawal } from 'src/domain/_layer/data/dto/transaction-debit-withdrawal.dto';

export type CreateTransactionDebitsdrawalDomainErrors =
  | UnknownDomainError
  | ProviderUnavailableDomainError
  | NoUserFoundDomainError;

export type CreateTransactionDebitWithdrawalResult = Either<
  CreateTransactionDebitsdrawalDomainErrors,
  TransactionDebitWithdrawal
>;

export type CreateTransactionDebitWithdrawalIO = EitherIO<
  CreateTransactionDebitsdrawalDomainErrors,
  TransactionDebitWithdrawal
>;

export abstract class CreateTransactionDebitsWithdrawalDomain {
  readonly create: (userId: string, body: TransactionDebitWithdrawalBodyInputDto) => CreateTransactionDebitWithdrawalIO;
}
