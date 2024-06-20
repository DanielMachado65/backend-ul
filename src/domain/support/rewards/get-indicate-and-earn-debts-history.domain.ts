import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { IndicateAndEarnInstanceDebit } from 'src/domain/_layer/presentation/dto/indicate-and-earn-history-debts.dto';

export type GetIndicateAndEarnDebitsHistoryDomainErrors = ProviderUnavailableDomainError;

export type GetIndicateAndEarnDebitsHistoryResult = Either<
  GetIndicateAndEarnDebitsHistoryDomainErrors,
  IndicateAndEarnInstanceDebit[]
>;

export type GetIndicateAndEarnDebitsHistoryIO = EitherIO<
  GetIndicateAndEarnDebitsHistoryDomainErrors,
  IndicateAndEarnInstanceDebit[]
>;

export abstract class GetIndicateAndEarnDebitsHistoryDomain {
  abstract getDebitsHistory(userId: string): GetIndicateAndEarnDebitsHistoryIO;
}
