import {
  IsCreditCard,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreditCardUtil } from '../util/credit-card.util';

const creditCardUtil: CreditCardUtil = new CreditCardUtil();

@ValidatorConstraint({ name: 'IsCreditCardHolderName' })
export class CreditCardHolderNameConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return creditCardUtil.isValidHolderName(value);
  }
}

@ValidatorConstraint({ name: 'IsCreditCardExpirationDate' })
export class CreditCardExpirationDateConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return creditCardUtil.isValidExpirationDate(value);
  }
}

@ValidatorConstraint({ name: 'IsCreditCardSecurityCode' })
export class CreditCardSecurityCodeConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return creditCardUtil.isValidSecurityCode(value);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsCreditCardNumber(validationOptions?: ValidationOptions): PropertyDecorator {
  return IsCreditCard(validationOptions);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsCreditCardHolderName(validationOptions?: ValidationOptions): PropertyDecorator {
  const message: string = 'Credit card holder name is not in the right format';

  // eslint-disable-next-line functional/no-return-void
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: { message, ...validationOptions },
      validator: CreditCardHolderNameConstraint,
    });
  };
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsCreditCardExpirationDate(validationOptions?: ValidationOptions): PropertyDecorator {
  const message: string = 'Credit card expiration date is not in the right format or is expired';

  // eslint-disable-next-line functional/no-return-void
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: { message, ...validationOptions },
      validator: CreditCardExpirationDateConstraint,
    });
  };
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsCreditCardSecurityCode(validationOptions?: ValidationOptions): PropertyDecorator {
  const message: string = 'Credit card security code is not in the right format';

  // eslint-disable-next-line functional/no-return-void
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: { message, ...validationOptions },
      validator: CreditCardSecurityCodeConstraint,
    });
  };
}
