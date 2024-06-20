import { EitherIO } from '@alissonfpmorais/minimal_fp';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';

export type AutomateUserDomainError = UnknownDomainError;

export type AutomateUserIO = EitherIO<AutomateUserDomainError, void>;

export abstract class AutomateUserDomain {
  abstract execute(user: UserDto): AutomateUserIO;
}
