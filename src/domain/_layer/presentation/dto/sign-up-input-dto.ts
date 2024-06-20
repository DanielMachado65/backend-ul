import { ApiProperty } from '@nestjs/swagger';
import { UserConsents } from 'src/domain/_entity/user-consents.entity';
import { UserAddress, UserCreationOrigin } from 'src/domain/_entity/user.entity';
import {
  ValidateUserAddressDomain,
  ValidateUserConsentsDomain,
  ValidateUserCpfDomain,
  ValidateUserCreationOriginDomain,
  ValidateUserEmailDomain,
  ValidateUserNameDomain,
  ValidateUserPasswordConfirmationDomain,
  ValidateUserPasswordDomain,
  ValidateUserPhoneNumberDomain,
} from 'src/infrastructure/decorators/validation-dto.decorator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export class SignUpInputDto {
  @ValidateUserEmailDomain()
  @ApiProperty()
  email: string;

  @ValidateUserNameDomain()
  @ApiProperty()
  name: string;

  @ValidateUserPasswordDomain()
  @ApiProperty()
  password: string;

  @ValidateUserPasswordConfirmationDomain('password')
  @ApiProperty()
  passwordConfirmation: string;

  @ValidateUserCpfDomain()
  @ApiProperty()
  cpf: string;

  @ValidateUserCreationOriginDomain()
  @EnumUtil.ApiProperty(UserCreationOrigin)
  creationOrigin: UserCreationOrigin;

  @ValidateUserConsentsDomain()
  @ApiProperty({ type: () => UserConsents, isArray: true })
  consents: ReadonlyArray<UserConsents>;

  @ValidateUserAddressDomain()
  @ApiProperty({ type: () => UserAddress })
  address?: UserAddress;

  @ValidateUserPhoneNumberDomain()
  @ApiProperty()
  phoneNumber: string;
}
