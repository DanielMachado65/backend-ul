import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { WhenUserDeletedDto } from 'src/domain/_layer/presentation/dto/when-user-deleted-output.dto';

type Data = WhenUserDeletedDto;

export type GetWhenUserDeletedErrors = UnknownDomainError | NoUserFoundDomainError;

export type GetWhenUserDeletedResult = Either<GetWhenUserDeletedErrors, Data>;

export type GetWhenUserDeletedIO = EitherIO<GetWhenUserDeletedErrors, Data>;

export abstract class GetWhenUserDeletedDomain {
  abstract get(userId: string): GetWhenUserDeletedIO;
}
