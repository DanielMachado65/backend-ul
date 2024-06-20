import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { StringUtil } from '../util/string.util';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsName(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line functional/no-return-void
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: NameConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsName' })
export class NameConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return StringUtil.isNameValid(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Nome Inválido: [${validationArguments.value}] por favor insira um nome válido.`;
  }
}
