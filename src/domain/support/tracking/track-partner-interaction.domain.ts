import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type TrackPartnerInteractionDomainErrors = UnknownDomainError;

export type TrackPartnerInteractionResult = Either<TrackPartnerInteractionDomainErrors, void>;

export type TrackPartnerInteractionIO = EitherIO<TrackPartnerInteractionDomainErrors, void>;

export abstract class TrackPartnerInteractionDomain {
  abstract track(userId: string, queryId: string, link: string): TrackPartnerInteractionIO;
}
