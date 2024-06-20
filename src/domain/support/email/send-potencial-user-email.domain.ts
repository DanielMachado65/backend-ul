import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';

export type SendPotencialUserEmailErrors = UnknownDomainError;

export type SendPotencialUserEmailResult = Either<SendPotencialUserEmailErrors, boolean>;

export type SendPotencialUserEmailIO = EitherIO<SendPotencialUserEmailErrors, boolean>;

export abstract class SendPotencialUserEmailDomain {
  abstract send(to: ReadonlyArray<string>, usersIds: ReadonlyArray<Pick<UserDto, 'id'>>): SendPotencialUserEmailIO;
}
