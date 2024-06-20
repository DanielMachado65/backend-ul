import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ApiProperty } from '@nestjs/swagger';
import { UserAddress, UserCreationOrigin, UserType } from 'src/domain/_entity/user.entity';
import { NoUserFoundDomainError, UnknownDomainError } from '../../_entity/result.error';
export class UserProfile {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly cpf: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly phoneNumber: string;

  @ApiProperty()
  readonly type: UserType;

  @ApiProperty()
  readonly lastLogin: string;

  @ApiProperty()
  readonly createdAt: string;

  @ApiProperty()
  readonly status: boolean;

  @ApiProperty()
  readonly creationOrigin: UserCreationOrigin;

  @ApiProperty()
  readonly address: UserAddress;

  @ApiProperty()
  readonly billingId: string;

  @ApiProperty()
  readonly needsPasswordUpdate: boolean;
}

export type GetUserProfileDomainErrors = NoUserFoundDomainError | UnknownDomainError;

export type GetUserProfileResult = Either<GetUserProfileDomainErrors, UserProfile>;

export type GetUserProfileIO = EitherIO<GetUserProfileDomainErrors, UserProfile>;

export abstract class GetUserProfileDomain {
  readonly getUserProfile: (userId: string) => GetUserProfileIO;
}
