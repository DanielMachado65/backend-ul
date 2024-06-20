import { CompanyMediaEntity } from 'src/domain/_entity/company.entity';
import { CompanyDto } from '../../data/dto/company.dto';
import { IBaseRepository } from './base.repository';

export abstract class CompanyRepository<TransactionReference = unknown>
  implements IBaseRepository<CompanyDto, TransactionReference>
{
  abstract getById(id: string): Promise<CompanyDto | null>;

  abstract insert(inputDto: Partial<CompanyDto>, transactionReference?: TransactionReference): Promise<CompanyDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<CompanyDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<CompanyDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<CompanyDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<CompanyDto>,
    transactionReference?: TransactionReference,
  ): Promise<CompanyDto | null>;

  abstract count(): Promise<number>;

  abstract getAllMedia(): Promise<ReadonlyArray<CompanyMediaEntity>>;
}
