import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';

export type GetUserDataInSheetDomainErrors = UnknownDomainError | NoUserFoundDomainError;

export type GetUserDataInSheetResult = Either<GetUserDataInSheetDomainErrors, Buffer>;

export type GetUserDataInSheetIO = EitherIO<GetUserDataInSheetDomainErrors, Buffer>;

export abstract class GetUserDataInSheetDomain {
  abstract getById(userId: string): GetUserDataInSheetIO;
}
