/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/prefer-readonly-type */
import { Injectable } from '@nestjs/common';
import * as deepmerge from 'deepmerge';

type UtilDeepMergeOptions = Record<string, never>;

export type DeepPartial<Type> = Type extends object
  ? {
      [P in keyof Type]?: DeepPartial<Type[P]>;
    }
  : Type;

@Injectable()
export class ObjectUtil {
  deepMerge<Type extends object>(x: Type, y: DeepPartial<Type>, _options?: UtilDeepMergeOptions): Type {
    return deepmerge<Type>(x, y, { arrayMerge: ObjectUtil._mergeArrayEntirely });
  }

  map<Type, ResultType>(
    target: Record<string, Type>,
    mapper: (arg0: string, arg1: Type, arg2: number) => ResultType,
  ): Record<string, ResultType> {
    return Object.fromEntries(
      Object.entries(target).map(([key, value]: [string, Type], index: number) => [key, mapper(key, value, index)]),
    );
  }

  private static _mergeArrayWithDifferentItems<Type extends object>(
    target: Array<Type>,
    source: Array<Type>,
    options: Record<string, any>,
  ): Array<Type> {
    const destination: Array<Type> = target.slice();

    source.forEach((item: Type, index: number) => {
      if (typeof destination[index] === 'undefined') {
        destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
      } else if (options.isMergeableObject(item)) {
        destination[index] = deepmerge(target[index], item, options);
      } else if (target.indexOf(item) === -1) {
        destination.push(item);
      }
    });
    return destination;
  }

  private static _mergeArrayEntirely<Type extends object>(
    target: Array<Type>,
    source: Array<Type>,
    options: Record<string, any>,
  ): Array<Type> {
    const destination: Array<Type> = target.slice();

    source.forEach((item: Type, index: number) => {
      if (typeof destination[index] === 'undefined') {
        destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
      } else if (options.isMergeableObject(item)) {
        destination[index] = deepmerge(target[index], item, options);
      } else {
        destination.push(item);
      }
    });
    return destination;
  }

  private static _mergeArrayOverwrite<Type extends object>(
    _target: Array<Type>,
    source: Array<Type>,
    _options: Record<string, any>,
  ): Array<Type> {
    return source;
  }

  static isNullOrEmptyOrUndefined(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }
}
