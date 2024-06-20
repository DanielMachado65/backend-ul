import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { IndicateAndEarnFundsDto } from 'src/domain/_layer/presentation/dto/indicate-and-earn-funds.dto';

export type GetIndicateAndEarnFundsDomainErrors = ProviderUnavailableDomainError;

export type GetIndicateAndEarnFundsResult = Either<GetIndicateAndEarnFundsDomainErrors, IndicateAndEarnFundsDto>;

export type GetIndicateAndEarnFundsIO = EitherIO<GetIndicateAndEarnFundsDomainErrors, IndicateAndEarnFundsDto>;

export abstract class GetIndicateAndEarnFundsDomain {
  abstract getFunds(userId: string): GetIndicateAndEarnFundsIO;
}
