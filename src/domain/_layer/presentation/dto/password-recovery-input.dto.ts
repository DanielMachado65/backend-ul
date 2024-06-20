import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, Length } from 'class-validator';
import { LowerCase } from 'src/infrastructure/decorators/lowercase.decorator';
import { IsCPF } from '../../../../infrastructure/decorators';

export class PasswordRecoveryEmailInputDto {
  @LowerCase()
  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional()
  email?: string;
}

export class PasswordRecoveryCpfInputDto {
  @IsNotEmpty()
  @Length(11)
  @IsNumberString()
  @IsCPF()
  @IsOptional()
  @ApiPropertyOptional()
  cpf?: string;
}
