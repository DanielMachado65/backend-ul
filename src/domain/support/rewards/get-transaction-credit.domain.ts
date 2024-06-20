import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { TransactionCreditOutputDto } from 'src/domain/_layer/presentation/dto/transaction-credit-output.dto';

export type GetTransactionCreditDomainErrors = ProviderUnavailableDomainError;

export type GetTransactionCreditResult = Either<GetTransactionCreditDomainErrors, TransactionCreditOutputDto>;

export type GetTransactionCreditIO = EitherIO<GetTransactionCreditDomainErrors, TransactionCreditOutputDto>;

export abstract class GetTransactionCreditDomain {
  abstract getTransactionCredit(userId: string): GetTransactionCreditIO;
}
