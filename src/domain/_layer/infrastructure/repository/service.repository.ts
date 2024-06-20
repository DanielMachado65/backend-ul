import { ServiceDto } from '../../data/dto/service.dto';
import { IBaseRepository } from './base.repository';

export abstract class ServiceRepository<TransactionReference = unknown>
  implements IBaseRepository<ServiceDto, TransactionReference>
{
  abstract getById(id: string): Promise<ServiceDto>;

  abstract insert(inputDto: Partial<ServiceDto>, transactionReference?: TransactionReference): Promise<ServiceDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<ServiceDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<ServiceDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<ServiceDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<ServiceDto>,
    transactionReference?: TransactionReference,
  ): Promise<ServiceDto>;

  abstract count(): Promise<number>;

  abstract getByServiceCode(serviceCode: number): Promise<ServiceDto>;

  abstract getManyByServicesCodes(servicesCodes: ReadonlyArray<number>): Promise<ReadonlyArray<ServiceDto>>;

  abstract getBatchByQueryComposerId(queryComposerId: string): Promise<ReadonlyArray<ServiceDto>>;
}
