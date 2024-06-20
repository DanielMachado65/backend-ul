import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserAddress } from 'src/domain/_entity/user.entity';
import {
  ValidateUserAddressDomain,
  ValidateUserCpfDomain,
  ValidateUserEmailDomain,
  ValidateUserNameDomain,
  ValidateUserPasswordConfirmationDomain,
  ValidateUserPasswordDomain,
  ValidateUserPhoneNumberDomain,
} from 'src/infrastructure/decorators/validation-dto.decorator';

export class UpdateUserProfileInputDto {
  @ValidateUserNameDomain()
  @IsOptional()
  @ApiProperty()
  name: string;

  @ValidateUserEmailDomain()
  @IsOptional()
  @ApiProperty()
  email: string;

  @ValidateUserPhoneNumberDomain()
  @IsOptional()
  @ApiProperty()
  phoneNumber?: string;

  @ValidateUserAddressDomain()
  @IsOptional()
  @ApiProperty({ type: () => UserAddress })
  address?: UserAddress;

  @ValidateUserCpfDomain()
  @IsOptional()
  @ApiProperty()
  cpf?: string;

  @ValidateUserPasswordDomain()
  @IsOptional()
  @ApiProperty()
  currentPassword?: string;

  @ValidateUserPasswordDomain()
  @IsOptional()
  @ApiProperty()
  newPassword?: string;

  @ValidateUserPasswordConfirmationDomain('newPassword')
  @IsOptional()
  @ApiProperty()
  passwordConfirmation?: string;
}
