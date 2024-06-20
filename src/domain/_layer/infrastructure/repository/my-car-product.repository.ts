import { FilterQuery, SortOrder } from 'mongoose';
import { MyCarProductEntity, MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import { QueryKeys } from 'src/domain/_entity/query.entity';
import { MyCarProductDto, MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { PaginationOf } from '../../data/dto/pagination.dto';
import { IBaseRepository } from './base.repository';

export type GetByCarIdOptions = {
  readonly includes: ReadonlyArray<string>;
  readonly only: ReadonlyArray<string>;
};

export type MyCarRepresentation1 = {
  id: string;
  subscriptionId: string;
  email: string;
  plate: string;
  activationDate: string;
  cancellationDate: string;
  status: string;
};

export type ListMyCarPaginatedFilters = {
  email?: string | null;
  subscriptionId?: string | null;
  myCarId?: string | null;
  plate?: string | null;
};

export abstract class MyCarProductRepository<TransactionReference = unknown>
  implements IBaseRepository<MyCarProductEntity, TransactionReference>
{
  abstract getAll(
    page: number,
    perPage: number,
    filterOptions?: FilterQuery<MyCarProductEntity>,
    sortOptions?: Record<string, SortOrder>,
  ): Promise<PaginationOf<MyCarProductDto>>;

  abstract getAllIncludeUser(
    filterOptions?: FilterQuery<MyCarProductEntity>,
  ): Promise<readonly MyCarProductWithUserDto[]>;
  abstract getById(id: string): Promise<MyCarProductEntity>;
  abstract listByUserId(
    userId: string,
    page: number,
    perPage: number,
    onlyStatuses?: ReadonlyArray<MyCarProductStatusEnum>,
  ): Promise<PaginationOf<MyCarProductDto>>;
  abstract insert(
    inputDto: Partial<MyCarProductEntity>,
    transactionReference?: TransactionReference,
  ): Promise<MyCarProductEntity>;

  abstract insertMany(
    inputs: readonly Partial<MyCarProductEntity>[],
    transactionReference?: TransactionReference,
  ): Promise<readonly MyCarProductEntity[]>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<MyCarProductEntity>;

  abstract updateById(
    id: string,
    updateDto: Partial<MyCarProductEntity>,
    transactionReference?: TransactionReference,
  ): Promise<MyCarProductEntity>;

  abstract count(): Promise<number>;

  abstract getBySubscriptionId(subscriptionId: string): Promise<MyCarProductEntity>;
  abstract getByIdAndBillingId(id: string, billingId: string): Promise<MyCarProductEntity>;
  abstract getByIdOwnedByUser(myCarId: string, userId: string): Promise<MyCarProductEntity>;
  abstract getByUserIdAndCarId(
    userId: string,
    carId: string,
    options?: GetByCarIdOptions,
  ): Promise<MyCarProductWithUserDto>;
  abstract getActiveByKeys(userId: string, keys: Partial<QueryKeys>): Promise<ReadonlyArray<MyCarProductWithUserDto>>;
  abstract hasActiveProduct(userId: string, fipeId: string, plate: string): Promise<boolean>;

  abstract countByUserId(userId: string, onlyStatuses?: ReadonlyArray<MyCarProductStatusEnum>): Promise<number>;
  abstract listPaginatedMyCars(
    page: number,
    perPage: number,
    filters: ListMyCarPaginatedFilters,
  ): Promise<PaginationOf<MyCarRepresentation1>>;
}
