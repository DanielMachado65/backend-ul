/* eslint-disable functional/immutable-data */
import { Types } from 'mongoose';
import { IBaseRepository } from 'src/domain/_layer/infrastructure/repository/base.repository';

type BuildTuple<
  Type,
  Length extends number,
  Current extends readonly [...(readonly Type[])] = readonly [],
> = Current['length'] extends Length ? Current : BuildTuple<Type, Length, readonly [Type, ...Current]>;

export type Tuple<Type, Length extends number> = Length extends number ? BuildTuple<Type, Length> : readonly Type[];

export type GenFunc<Type, OwnId extends string = 'id'> = (
  defaults?: Partial<Type>,
  variant?: number,
) => GenFuncOperations<Type, OwnId>;

export type WithoutId<Type> = Omit<Type, 'id'>;

export type GenMultipleOperations<Length extends number, Type, OwnId extends string> = {
  readonly show: () => Tuple<Omit<Type, OwnId>, Length>;
  readonly insert: (repo: IBaseRepository<unknown, unknown>) => Promise<Tuple<Type, Length>>;
};

export class IGenMultipleOperations<Length extends number, Type, OwnId extends string> {
  constructor(private readonly _dtos: Tuple<Omit<Type, OwnId>, Length>) {}

  public show(): Tuple<Omit<Type, OwnId>, Length> {
    return this._dtos;
  }

  public insert(repo: IBaseRepository<Type, unknown>): Promise<Tuple<Type, Length>> {
    return repo.insertMany(this._dtos as readonly Type[]) as Promise<Tuple<Type, Length>>;
  }
}

export type GenFuncOperations<Type, OwnId extends string> = {
  readonly show: () => Omit<Type, OwnId>;
  readonly insert: (repo: IBaseRepository<unknown, unknown>) => Promise<Type>;
  readonly update: (repo: IBaseRepository<unknown, unknown>, id: string) => Promise<Type>;
  readonly many: <LengthNumber extends number>(
    length: LengthNumber,
  ) => GenMultipleOperations<LengthNumber, Type, OwnId>;
};

export class IGenFuncOperations<Type, OwnId extends string> {
  constructor(private readonly _generatedDto: Omit<Type, OwnId>) {}

  public show(): Omit<Type, OwnId> {
    return this._generatedDto;
  }

  public async insert(repo: IBaseRepository<Type, unknown>): Promise<Type> {
    return repo.insert(this._generatedDto as Type);
  }

  public async update(repo: IBaseRepository<Type, unknown>, id: string): Promise<Type> {
    return repo.updateById(id, this._generatedDto as Type);
  }
}

export type GenFuncWithVariant<Type, OwnId extends string = 'id'> = (variant: number) => Omit<Type, OwnId>;

export class VariantGenerator {
  private static _next: number = 0;

  public static genNumberVariant(): number {
    // eslint-disable-next-line functional/immutable-data
    return VariantGenerator._next++;
  }

  public static generateTuple<Length extends number>(length: Length): Tuple<number, Length> {
    // eslint-disable-next-line functional/immutable-data
    return [...Array(length).keys()].map((_n: number) => this.genNumberVariant()) as Tuple<number, Length>;
  }
}

export function factoryAutomaticVariantGenFunc<Type, OwnId extends string = 'id'>(
  fn: GenFuncWithVariant<Type, OwnId>,
): GenFunc<Type, OwnId> {
  return (defaults: Partial<Omit<Type, 'id'>> = {}, variant?: number): GenFuncOperations<Type, OwnId> => {
    const useVariant: number = variant === undefined || variant < 0 ? VariantGenerator.genNumberVariant() : variant;
    const generatedDto: Omit<Type, OwnId> = { ...fn(useVariant), ...defaults };

    return {
      show: (): Omit<Type, OwnId> => generatedDto,
      insert: (repo: IBaseRepository<Type, unknown>): Promise<Type> => repo.insert(generatedDto as Type),
      update: (repo: IBaseRepository<Type, unknown>, id: string): Promise<Type> =>
        repo.updateById(id, generatedDto as Type),

      many: <Length extends number>(length: Length): GenMultipleOperations<Length, Type, OwnId> => {
        const mapFunc = (n: number): Omit<Type, OwnId> => ({
          ...fn(n),
          ...defaults,
        });
        const dtos: readonly Omit<Type, OwnId>[] = VariantGenerator.generateTuple(length).map(mapFunc);

        return {
          show: (): Tuple<Omit<Type, OwnId>, Length> => dtos as Tuple<Omit<Type, OwnId>, Length>,
          insert: (repo: IBaseRepository<Type, unknown>): Promise<Tuple<Type, Length>> =>
            repo.insertMany(dtos as readonly Type[]) as Promise<Tuple<Type, Length>>,
        };
      },
    };
  };
}

export function getDateIso(value: number): string {
  return new Date(value).toISOString();
}

export class TestUtil {
  static getDateIso(value: number): string {
    return new Date(value).toISOString();
  }

  static generateId(): string {
    return new Types.ObjectId().toString();
  }
}
