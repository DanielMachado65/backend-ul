import { IBaseRepository } from './base.repository';
import { NfeDto } from '../../data/dto/nfe.dto';

export abstract class NfeRepository<TransactionReference = unknown>
  implements IBaseRepository<NfeDto, TransactionReference>
{
  abstract getById(id: string): Promise<NfeDto | null>;

  abstract insert(inputDto: Partial<NfeDto>, transactionReference?: TransactionReference): Promise<NfeDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<NfeDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<NfeDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<NfeDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<NfeDto>,
    transactionReference?: TransactionReference,
  ): Promise<NfeDto | null>;

  abstract count(): Promise<number>;
}
