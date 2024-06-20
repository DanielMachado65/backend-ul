import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { CompleteUserConsent } from 'src/domain/_entity/user-consents.entity';

export type GiveOrRemoveConsentErrors = UnknownDomainError;

export type GiveOrRemoveConsentResult = Either<GiveOrRemoveConsentErrors, CompleteUserConsent>;

export type GiveOrRemoveConsentIO = EitherIO<GiveOrRemoveConsentErrors, CompleteUserConsent>;

export abstract class GiveOrRemoveConsentDomain {
  abstract toggle(consentId: string, userId: string, hasGivenConsent: boolean): GiveOrRemoveConsentIO;
}
