import { PlanEntity } from 'src/domain/_entity/plan.entity';
import { IBaseRepository } from './base.repository';

export abstract class PlanRepository<TransactionReference = unknown>
  implements IBaseRepository<PlanEntity, TransactionReference>
{
  abstract getById(id: string): Promise<PlanEntity>;
  abstract insert(inputDto: Partial<PlanEntity>, transactionReference?: TransactionReference): Promise<PlanEntity>;
  abstract insertMany(
    inputs: readonly Partial<PlanEntity>[],
    transactionReference?: TransactionReference,
  ): Promise<readonly PlanEntity[]>;
  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<PlanEntity>;
  abstract updateById(
    id: string,
    updateDto: Partial<PlanEntity>,
    transactionReference?: TransactionReference,
  ): Promise<PlanEntity>;
  abstract count(): Promise<number>;
}
