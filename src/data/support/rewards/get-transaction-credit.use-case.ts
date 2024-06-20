import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { TransactionCredit } from 'src/domain/_layer/data/dto/transaction-credit.dto';
import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { TransactionCreditOutputDto } from 'src/domain/_layer/presentation/dto/transaction-credit-output.dto';
import {
  GetTransactionCreditDomain,
  GetTransactionCreditIO,
} from 'src/domain/support/rewards/get-transaction-credit.domain';

@Injectable()
export class GetTransactionCreditUseCase implements GetTransactionCreditDomain {
  constructor(private readonly _indicateAndEarn: IndicateAndEarnService) {}

  getTransactionCredit(userId: string): GetTransactionCreditIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), this._fetchTransaction(userId)).map(
      this._parseTransactionCredit,
    );
  }

  private _fetchTransaction(userId: string): () => Promise<ReadonlyArray<TransactionCredit>> {
    return async () => {
      return await this._indicateAndEarn.getTransactionCredit(userId);
    };
  }

  private _parseTransactionCredit(transactionCredit: TransactionCredit[]): TransactionCreditOutputDto {
    return transactionCredit.map((credit: TransactionCredit) => ({
      createdAt: credit.createdAt,
      indicatedName: credit.indicatedName,
      originValueInCents: credit.originValueInCents,
      valueInCents: credit.originValueInCents,
    }));
  }
}
