import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';

export type GetIndicateAndEarnHashlinkDomainErrors = ProviderUnavailableDomainError;

export type GetIndicateAndEarnHashlinkResult = Either<GetIndicateAndEarnHashlinkDomainErrors, string>;

export type GetIndicateAndEarnHashlinkIO = EitherIO<GetIndicateAndEarnHashlinkDomainErrors, string>;

export abstract class GetIndicateAndEarnHashlinkDomain {
  abstract getLink(userId: string): GetIndicateAndEarnHashlinkIO;
}
