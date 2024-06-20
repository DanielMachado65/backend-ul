import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from '../../_entity/result.error';
import { TransactionDebitWithOncWalletSuccess } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-output.dto';
import { TransactionDebitWithOncWalletBodyDto } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-input.dto';

export type CreateTransactionDebitsWithOncWalletDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type CreateTransactionDebitsWithOncWalletsResult = Either<
  CreateTransactionDebitsWithOncWalletDomainErrors,
  TransactionDebitWithOncWalletSuccess
>;

export type CreateTransactionDebitsWithOncWalletsIO = EitherIO<
  CreateTransactionDebitsWithOncWalletDomainErrors,
  TransactionDebitWithOncWalletSuccess
>;

export abstract class CreateTransactionDebitsWithOncWalletDomain {
  readonly create: (
    userId: string,
    body: TransactionDebitWithOncWalletBodyDto,
  ) => CreateTransactionDebitsWithOncWalletsIO;
}
