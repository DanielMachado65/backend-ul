import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UserConsents } from 'src/domain/_entity/user-consents.entity';
import { UserAddress, UserCreationOrigin } from 'src/domain/_entity/user.entity';
import {
  InvalidPostalCodeDomainError,
  UnknownDomainError,
  UserAlreadyExistsDomainError,
} from '../../_entity/result.error';
import { TokenEntity } from '../../_entity/token.entity';
import { DeviceKind } from '../../_layer/infrastructure/middleware/device-info.middleware';

export type AddUserDomainErrors = UnknownDomainError | UserAlreadyExistsDomainError | InvalidPostalCodeDomainError;

export type AddUserParams = {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly password: string;
  readonly phoneNumber?: string;
  readonly address?: UserAddress;
  readonly creationOrigin: UserCreationOrigin;
  readonly consents: ReadonlyArray<UserConsents>;
  readonly isCarRevendor?: boolean;
};

export type AddUserResult = Either<AddUserDomainErrors, TokenEntity>;

export type AddUserIO = EitherIO<AddUserDomainErrors, TokenEntity>;

export abstract class AddUserDomain {
  readonly addUser: (user: AddUserParams, deviceKind: DeviceKind, reqParentId: string) => AddUserIO;
}
