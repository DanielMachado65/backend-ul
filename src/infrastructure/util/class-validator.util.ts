import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { ValidationError, validate, validateSync } from 'class-validator';
import { InvalidObjectDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';

// eslint-disable-next-line @typescript-eslint/ban-types
type BodyType = object;

type ClassToType<Class> = {
  readonly [Key in keyof Class]: Class[Key];
};

@Injectable()
export class ClassValidatorUtil {
  validateSync<DtoValidator>(
    data: BodyType,
    classValidator: ClassConstructor<DtoValidator>,
  ): data is ClassToType<DtoValidator> {
    return this.validateSyncAndResult(data, classValidator).isRight();
  }

  validateAndResult<DtoValidator>(
    data: BodyType,
    classValidator: ClassConstructor<DtoValidator>,
  ): EitherIO<InvalidObjectDomainError, DtoValidator> {
    return EitherIO.from(
      (error: unknown) => {
        if (error instanceof InvalidObjectDomainError) return error;
        return UnknownDomainError.toFn()(error);
      },
      async () => {
        const object: DtoValidator = plainToClass(classValidator, data);
        const errors: ReadonlyArray<ValidationError> = await validate(object as Record<string, unknown>);
        if (errors.length > 0) throw new InvalidObjectDomainError({ message: errors });
        return object as DtoValidator;
      },
    );
  }

  validateSyncAndResult<DtoValidator>(
    data: BodyType,
    classValidator: ClassConstructor<DtoValidator>,
  ): Either<InvalidObjectDomainError, DtoValidator> {
    const object: DtoValidator = plainToClass(classValidator, data);
    const errors: ReadonlyArray<ValidationError> = validateSync(object as Record<string, unknown>);
    if (errors.length > 0) return Either.left(new InvalidObjectDomainError({ message: errors }));
    return Either.right(object as DtoValidator);
  }
}
