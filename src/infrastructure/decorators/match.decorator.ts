import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Match(property: string, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line functional/no-return-void
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [relatedPropertyName]: ReadonlyArray<string> = args.constraints;
    const relatedValue: unknown = (args.object as unknown)[relatedPropertyName];
    return value === relatedValue;
  }
}
