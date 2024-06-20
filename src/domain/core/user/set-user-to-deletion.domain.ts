import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserProfile } from './get-user-profile.domain';

export type SetUserToDeletionDomainErrors = UnknownDomainError | NoUserFoundDomainError;

export type SetUserToDeletionIO = EitherIO<SetUserToDeletionDomainErrors, UserProfile>;

export abstract class SetUserToDeletionDomain {
  abstract setUserToDeletion(userId: string): SetUserToDeletionIO;
}
