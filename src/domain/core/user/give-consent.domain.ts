import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserConsents } from 'src/domain/_entity/user-consents.entity';

export type GiveConsentErrors = UnknownDomainError;

export type GiveConsentResult = Either<GiveConsentErrors, void>;

export type GiveConsentIO = EitherIO<GiveConsentErrors, void>;

export abstract class GiveConsentDomain {
  abstract create(userId: string, consentId: string, consents: UserConsents): GiveConsentIO;
}
