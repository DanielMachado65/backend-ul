import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import {
  IndicateAndEarnService,
  TransactionsDebit,
} from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import {
  IndicateAndEarnInstanceDebit,
  IndicateAndEarnInstanceDebitStatus,
  IndicateAndEarnInstanceDebitType,
} from 'src/domain/_layer/presentation/dto/indicate-and-earn-history-debts.dto';
import {
  GetIndicateAndEarnDebitsHistoryDomain,
  GetIndicateAndEarnDebitsHistoryIO,
} from 'src/domain/support/rewards/get-indicate-and-earn-debts-history.domain';

@Injectable()
export class GetIndicateAndEarnDebitsHistoryUseCase implements GetIndicateAndEarnDebitsHistoryDomain {
  constructor(private readonly _indicateApiService: IndicateAndEarnService) {}

  getDebitsHistory(userId: string): GetIndicateAndEarnDebitsHistoryIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._indicateApiService.getTransactionsDebits(userId),
    ).map((debits: TransactionsDebit[]) =>
      debits.map(
        (dt: TransactionsDebit): IndicateAndEarnInstanceDebit => ({
          createdAt: dt.createdAt,
          status: dt.status as IndicateAndEarnInstanceDebitStatus,
          type: dt.type as IndicateAndEarnInstanceDebitType,
          valueInCents: dt.value,
        }),
      ),
    );
  }
}
