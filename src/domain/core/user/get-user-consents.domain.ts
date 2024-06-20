import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { CompleteUserConsent } from 'src/domain/_entity/user-consents.entity';

export type GetUserConsentsErrors = UnknownDomainError;

export type GetUserConsentsResult = Either<GetUserConsentsErrors, ReadonlyArray<CompleteUserConsent>>;

export type GetUserConsentsIO = EitherIO<GetUserConsentsErrors, ReadonlyArray<CompleteUserConsent>>;

export abstract class GetUserConsentsDomain {
  abstract getConsents(userId: string): GetUserConsentsIO;
}
