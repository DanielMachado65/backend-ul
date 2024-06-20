import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type GetUserCountErrors = UnknownDomainError;

export type GetUserCountResult = Either<GetUserCountErrors, number>;

export type GetUserCountIO = EitherIO<GetUserCountErrors, number>;

export abstract class GetUserCountDomain {
  abstract getCount(): GetUserCountIO;
}
