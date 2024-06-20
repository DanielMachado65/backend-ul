import { TotalTestDriveEntity } from 'src/domain/_entity/total-test-drive.entity';
import { TotalTestDriveDto } from 'src/domain/_layer/data/dto/total-test-drive.dto';
import { IBaseRepository } from './base.repository';

export abstract class TotalTestDriveRepository<TransactionReference = unknown>
  implements IBaseRepository<TotalTestDriveDto, TransactionReference>
{
  insert: (
    inputDto: Partial<TotalTestDriveEntity>,
    transactionReference?: TransactionReference,
  ) => Promise<TotalTestDriveEntity>;
  insertMany: (
    inputs: readonly Partial<TotalTestDriveEntity>[],
    transactionReference?: TransactionReference,
  ) => Promise<readonly TotalTestDriveEntity[]>;
  removeById: (id: string, transactionReference?: TransactionReference) => Promise<TotalTestDriveEntity>;
  updateById: (
    id: string,
    updateDto: Partial<TotalTestDriveEntity>,
    transactionReference?: TransactionReference,
  ) => Promise<TotalTestDriveEntity>;
  count: () => Promise<number>;
  getById: (id: string) => Promise<TotalTestDriveEntity>;
  getCurrent: () => Promise<TotalTestDriveEntity>;
}
