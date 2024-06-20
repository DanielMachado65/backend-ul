import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryComposerEntity } from '../../_entity/query-composer.entity';
import { NoProductFoundDomainError, NoUserFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type GetQueryComposerDomainErrors = UnknownDomainError | NoUserFoundDomainError | NoProductFoundDomainError;

export type GetQueryComposerResult = Either<GetQueryComposerDomainErrors, QueryComposerEntity>;

export type GetQueryComposerIO = EitherIO<GetQueryComposerDomainErrors, QueryComposerEntity>;

export abstract class GetQueryComposerDomain {
  readonly getQueryComposer: (userId: string, queryCode: number) => GetQueryComposerIO;
}
