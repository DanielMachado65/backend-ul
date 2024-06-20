import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CpfUtil } from '../util/cpf.util';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsCPF(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line functional/no-return-void
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: CPFConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsCPF' })
export class CPFConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return new CpfUtil().isValidCpf(value);
  }
}
