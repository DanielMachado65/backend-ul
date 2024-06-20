import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import {
  GetIndicateAndEarnFundsIO,
  GetIndicateAndEarnFundsDomain,
} from 'src/domain/support/rewards/get-indicate-and-earn-funds.domain';

@Injectable()
export class GetIndicateAndEarnFundsUseCase implements GetIndicateAndEarnFundsDomain {
  constructor(private readonly _indicateApiService: IndicateAndEarnService) {}

  getFunds(userId: string): GetIndicateAndEarnFundsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._indicateApiService.getTransactionsTotals(userId),
    );
  }
}
