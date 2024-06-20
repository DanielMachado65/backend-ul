import { applyDecorators, Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';

@Injectable()
export class EnumUtil {
  private static _removeNumbers(value: string): boolean {
    return isNaN(Number(value));
  }

  static enumToArray<Type extends Record<string, unknown>>(enumObj: Type): ReadonlyArray<unknown> {
    return Object.keys(enumObj)
      .filter(EnumUtil._removeNumbers)
      .map((key: string) => EnumUtil._mapEnum(key, enumObj));
  }

  private static _mapEnum<Type extends Record<string, unknown>>(key: string, enumObj: Type): unknown {
    const value: unknown = enumObj[key];
    return typeof value === 'number' ? `${value} (${key})` : value;
  }

  static ApiProperty<Type extends Record<string, unknown>>(
    enumObj: Type,
    options: Omit<ApiPropertyOptions, 'enum'> = {},
  ): PropertyDecorator {
    const enumValues: ReadonlyArray<unknown> = EnumUtil.enumToArray(enumObj);
    return applyDecorators(ApiProperty({ ...options, enum: enumValues }));
  }

  static ApiPropertyOptional<Type extends Record<string, unknown>>(
    enumObj: Type,
    options: Omit<ApiPropertyOptions, 'enum'> = {},
  ): PropertyDecorator {
    const enumValues: ReadonlyArray<unknown> = EnumUtil.enumToArray(enumObj);
    return applyDecorators(ApiPropertyOptional({ ...options, enum: enumValues }));
  }
}
