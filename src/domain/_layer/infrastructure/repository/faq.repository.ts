import { FaqEssentialsEntity } from 'src/domain/_entity/faq.entity';
import { FaqDto } from '../../data/dto/faq.dto';
import { IBaseRepository } from './base.repository';

export abstract class FaqRepository<TransactionReference = unknown>
  implements IBaseRepository<FaqDto, TransactionReference>
{
  abstract getById(id: string): Promise<FaqDto | null>;

  abstract insert(inputDto: Partial<FaqDto>, transactionReference?: TransactionReference): Promise<FaqDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<FaqDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<FaqDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<FaqDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<FaqDto>,
    transactionReference?: TransactionReference,
  ): Promise<FaqDto | null>;

  abstract count(): Promise<number>;

  abstract getAllFromCompanies(): Promise<ReadonlyArray<FaqEssentialsEntity>>;
}
