import { TestDriveQueryDto } from '../../data/dto/test-drive-query.dto';
import { IBaseRepository } from './base.repository';

export abstract class TestDriveQueryRepository<TransactionReference = unknown>
  implements IBaseRepository<TestDriveQueryDto, TransactionReference>
{
  abstract getById(id: string): Promise<TestDriveQueryDto>;

  abstract insert(
    inputDto: Partial<TestDriveQueryDto>,
    transactionReference?: TransactionReference,
  ): Promise<TestDriveQueryDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<TestDriveQueryDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<TestDriveQueryDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<TestDriveQueryDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<TestDriveQueryDto>,
    transactionReference?: TransactionReference,
  ): Promise<TestDriveQueryDto>;

  abstract count(): Promise<number>;

  abstract countByDay(): Promise<number>;
}
