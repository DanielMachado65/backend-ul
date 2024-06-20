import { PaginationOf } from '../../data/dto/pagination.dto';
import { PlanDto } from '../../data/dto/plan.dto';
import { SubscriptionDto } from '../../data/dto/subscription.dto';
import { IBaseRepository } from './base.repository';

export abstract class SubscriptionRepository<TransactionReference = unknown>
  implements IBaseRepository<SubscriptionDto, TransactionReference>
{
  abstract getById(id: string): Promise<SubscriptionDto>;

  abstract insert(
    inputDto: Partial<SubscriptionDto>,
    transactionReference?: TransactionReference,
  ): Promise<SubscriptionDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<SubscriptionDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<SubscriptionDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<SubscriptionDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<SubscriptionDto>,
    transactionReference?: TransactionReference,
  ): Promise<SubscriptionDto>;

  abstract count(): Promise<number>;

  abstract generateNewId(): string;

  abstract getByIdOwnedByUser(subscriptionId: string, userId: string): Promise<SubscriptionDto>;

  abstract getPaginatedOwnedByUser(
    userId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationOf<SubscriptionDto & { plan: PlanDto }>>;

  abstract getAllByBilling(billingId: string): Promise<ReadonlyArray<SubscriptionDto>>;
}
