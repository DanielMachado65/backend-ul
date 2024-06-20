import { CarRevendorDto } from '../../data/dto/car-revendor.dto';
import { IBaseRepository } from './base.repository';

export abstract class CarRevendorRepository<TransactionReference = unknown>
  implements IBaseRepository<CarRevendorDto, TransactionReference>
{
  abstract getById(id: string): Promise<CarRevendorDto | null>;

  abstract insert(
    inputDto: Partial<CarRevendorDto>,
    transactionReference?: TransactionReference,
  ): Promise<CarRevendorDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<CarRevendorDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<CarRevendorDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<CarRevendorDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<CarRevendorDto>,
    transactionReference?: TransactionReference,
  ): Promise<CarRevendorDto | null>;

  abstract count(): Promise<number>;

  abstract getByUserId(userId: string): Promise<CarRevendorDto | null>;
}
