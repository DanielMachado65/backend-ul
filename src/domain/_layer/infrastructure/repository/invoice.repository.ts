import { IBaseRepository } from './base.repository';
import { InvoiceDto } from '../../data/dto/invoice.dto';

export abstract class InvoiceRepository<TransactionReference = unknown>
  implements IBaseRepository<InvoiceDto, TransactionReference>
{
  abstract getById(id: string): Promise<InvoiceDto | null>;

  abstract insert(inputDto: Partial<InvoiceDto>, transactionReference?: TransactionReference): Promise<InvoiceDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<InvoiceDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<InvoiceDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<InvoiceDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<InvoiceDto>,
    transactionReference?: TransactionReference,
  ): Promise<InvoiceDto | null>;

  abstract count(): Promise<number>;
}
