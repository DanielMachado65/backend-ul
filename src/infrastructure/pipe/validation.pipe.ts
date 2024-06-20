import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { BadRequestDomainError } from 'src/domain/_entity/result.error';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  private static _isPrimitiveType(metatype: unknown): boolean {
    const types: ReadonlyArray<unknown> = [String, Boolean, Number, Array, Object];
    return !metatype || types.includes(metatype);
  }

  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> | never {
    const shouldSkipValidation: boolean = !metatype || ValidationPipe._isPrimitiveType(metatype);
    if (shouldSkipValidation) return value;
    const object: Record<string, unknown> = plainToClass(metatype, value);
    const errors: ReadonlyArray<ValidationError> = await validate(object);
    if (errors.length > 0) throw new BadRequestDomainError({ message: errors });
    return object;
  }
}
