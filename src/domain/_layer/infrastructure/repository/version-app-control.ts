import { VersionAppControlEntity } from 'src/domain/_entity/version-app.control.entity';
import { VersionAppControlDto } from '../../data/dto/version-app-control.dto';
import { IBaseRepository } from './base.repository';

export abstract class VersionAppControlRepository<TransactionReference = unknown>
  implements IBaseRepository<VersionAppControlDto, TransactionReference>
{
  abstract getById(id: string): Promise<VersionAppControlEntity>;

  abstract insert(
    inputDto: Partial<VersionAppControlEntity>,
    transactionReference?: TransactionReference,
  ): Promise<VersionAppControlDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<VersionAppControlEntity>>,
    transactionReference?: TransactionReference | undefined,
  ): Promise<ReadonlyArray<VersionAppControlDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<VersionAppControlEntity>;

  abstract updateById(
    id: string,
    updateDto: Partial<VersionAppControlEntity>,
    transactionReference?: TransactionReference,
  ): Promise<VersionAppControlDto>;

  abstract count(): Promise<number>;

  abstract getByDeviceType(deviceType: string): Promise<VersionAppControlDto>;
}
