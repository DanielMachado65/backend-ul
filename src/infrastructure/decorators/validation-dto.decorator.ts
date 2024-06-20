/* eslint-disable @typescript-eslint/naming-convention */
import { applyDecorators } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  MinLength,
  ValidationArguments,
} from 'class-validator';
import { UserAddress, UserCreationOrigin } from 'src/domain/_entity/user.entity';
import { IsCPF } from './cpf.decorator';
import { LowerCase } from './lowercase.decorator';
import { Match } from './match.decorator';
import { IsName } from './name.decorator';

export function ValidateUserEmailDomain(): PropertyDecorator {
  return applyDecorators(LowerCase(), IsString(), IsEmail(), MinLength(4));
}

export function ValidateUserNameDomain(): PropertyDecorator {
  return applyDecorators(IsNotEmpty(), MinLength(4), IsString(), IsName());
}

export function ValidateUserPasswordDomain(): PropertyDecorator {
  return applyDecorators(IsString(), MinLength(4), IsNotEmpty());
}

export function ValidateUserPasswordConfirmationDomain(otherFieldToMatch: string): PropertyDecorator {
  return applyDecorators(ValidateUserPasswordDomain(), Match(otherFieldToMatch));
}

export function ValidateUserCpfDomain(): PropertyDecorator {
  return applyDecorators(IsNotEmpty(), Length(11), IsNumberString(), IsCPF());
}

export function ValidateUserCreationOriginDomain(): PropertyDecorator {
  return applyDecorators(IsString(), IsNotEmpty(), IsEnum(UserCreationOrigin));
}

export function ValidateUserConsentsDomain(): PropertyDecorator {
  return applyDecorators(IsNotEmpty(), IsArray());
}

export function ValidateUserAddressDomain(): PropertyDecorator {
  return applyDecorators(
    IsObject(),
    IsOptional(),
    Type(() => UserAddress),
  );
}

export function ValidateUserPhoneNumberDomain(): PropertyDecorator {
  return applyDecorators(
    /**
     * Este transform é utilizado para acrescentar o número `9`
     * em todos os celulares que são enviados sem esse `9` adicional
     *
     * Link de referência: https://pt.stackoverflow.com/a/14356
     */
    Transform(({ value }: { readonly value: string }) => {
      if (value.length >= 11) return value;

      const firstDigit: number = Number(value.charAt(2));
      if (firstDigit < 6) return value;

      return `${value.substring(0, 2)}9${value.substring(2)}`;
    }),
    IsPhoneNumber('BR', {
      message: (message: ValidationArguments) => `O número de telefone ${message.value} é inválido`,
    }),
  );
}
