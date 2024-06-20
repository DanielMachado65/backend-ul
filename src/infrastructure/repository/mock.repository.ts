/* eslint-disable functional/prefer-readonly-type */
/* eslint-disable functional/immutable-data */
import { IBaseRepository } from 'src/domain/_layer/infrastructure/repository/base.repository';
import { WithId } from './mongo.repository';

export type DefaultFilter<Something> = (value?: Something | null, index?: number, array?: Something[]) => boolean;

export type FilterOptions = {
  runUnsafe: boolean;
};
const defaultFilterOptions: FilterOptions = {
  runUnsafe: false,
};

// MockRepository<Dto, Schema = Dto>
export abstract class MockRepository<Dto> implements IBaseRepository<WithId<Dto>, null> {
  private _data: WithId<Dto>[] = [];

  abstract getDtoWithDefaults(dto: Partial<Dto>): Dto;

  private static _isInvalidType(dto: unknown): boolean {
    return dto === undefined || dto === null;
  }

  private static _responseOnNotFound(): null | never {
    return null;
  }

  private _createFilterWrapper<Type>(filter: DefaultFilter<Type>): DefaultFilter<Type> {
    return (value: Type | null, index: number, array: Type[]): boolean => {
      try {
        return filter(value, index, array);
      } catch (error) {
        return false;
      }
    };
  }

  async getById(_id: string): Promise<WithId<Dto>> {
    const id: number = parseInt(_id);
    const result: WithId<Dto> | undefined = this._data[id];
    return MockRepository._isInvalidType(result) ? MockRepository._responseOnNotFound() : result;
  }

  async getBy(
    filter: DefaultFilter<WithId<Dto>>,
    filterOpt: FilterOptions = defaultFilterOptions,
  ): Promise<WithId<Dto>> {
    const useFilter: DefaultFilter<WithId<Dto>> = filterOpt.runUnsafe ? filter : this._createFilterWrapper(filter);
    const result: WithId<Dto> | undefined = this._data.find(useFilter);
    return MockRepository._isInvalidType(result) ? MockRepository._responseOnNotFound() : result;
  }

  async getManyBy(
    filter: DefaultFilter<WithId<Dto>>,
    filterOpt: FilterOptions = defaultFilterOptions,
  ): Promise<WithId<Dto>[]> {
    const useFilter: DefaultFilter<WithId<Dto>> = filterOpt.runUnsafe ? filter : this._createFilterWrapper(filter);
    const result: WithId<Dto>[] = this._data.filter(useFilter);
    return MockRepository._isInvalidType(result) ? MockRepository._responseOnNotFound() : result;
  }

  async insert(inputDto: Partial<Dto>, _transactionReference?: null): Promise<WithId<Dto>> {
    return this._insertSync(inputDto, _transactionReference);
  }

  private _insertSync(inputDto: Partial<Dto>, _transactionReference?: null): WithId<Dto> {
    const idString: string = this._data.length.toString();
    const newItem: WithId<Dto> = { ...this.getDtoWithDefaults(inputDto), id: idString };
    this._data.push(newItem);
    return newItem;
  }

  async insertMany(inputs: readonly Partial<Dto>[], _transactionReference?: null): Promise<readonly WithId<Dto>[]> {
    const initialIndex: number = this._data.length;
    inputs.map(this._insertSync.bind(this));
    return this._data.slice(initialIndex);
  }

  async removeById(_id: string, _transactionReference?: null): Promise<WithId<Dto>> {
    const id: number = parseInt(_id);
    const itemToBeRemoved: WithId<Dto> = this._data[id];

    if (MockRepository._isInvalidType(itemToBeRemoved)) return MockRepository._responseOnNotFound();

    this._data[id] = null;
    return itemToBeRemoved;
  }

  async updateById(_id: string, updateDto: Partial<Dto>, _transactionReference?: null): Promise<WithId<Dto>> {
    const id: number = parseInt(_id);
    const itemToBeUpdated: WithId<Dto> = this._data[id];

    if (MockRepository._isInvalidType(itemToBeUpdated)) return MockRepository._responseOnNotFound();

    const updatedItem: WithId<Dto> = { ...itemToBeUpdated, ...updateDto, id: _id };
    this._data[id] = updatedItem;

    return updatedItem;
  }

  async count(): Promise<number> {
    return this._data.filter((item: WithId<Dto>) => item !== null).length;
  }
}
