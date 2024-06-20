import { PackageDto } from '../../data/dto/package.dto';
import { IBaseRepository } from './base.repository';

export abstract class PackageRepository<TransactionReference = unknown>
  implements IBaseRepository<PackageDto, TransactionReference>
{
  abstract getBatchByIds(ids: ReadonlyArray<string>): Promise<ReadonlyArray<PackageDto>>;

  abstract getById(id: string): Promise<PackageDto | null>;

  abstract insert(inputDto: Partial<PackageDto>, transactionReference?: TransactionReference): Promise<PackageDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<PackageDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<PackageDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<PackageDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<PackageDto>,
    transactionReference?: TransactionReference,
  ): Promise<PackageDto | null>;

  abstract count(): Promise<number>;

  abstract getAll(): Promise<ReadonlyArray<PackageDto>>;
}
