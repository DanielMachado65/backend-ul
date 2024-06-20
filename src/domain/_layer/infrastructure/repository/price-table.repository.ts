import {
  DetailedPriceTableDto,
  PriceTableDto,
  PriceTablePlanDto,
  PriceTableProductDto,
} from '../../data/dto/price-table.dto';
import { IBaseRepository } from './base.repository';

export abstract class PriceTableRepository<TransactionReference = unknown>
  implements IBaseRepository<PriceTableDto, TransactionReference>
{
  abstract defaultPriceTableName: string;

  abstract getById(id: string): Promise<PriceTableDto | null>;

  abstract insert(
    inputDto: Partial<PriceTableDto>,
    transactionReference?: TransactionReference,
  ): Promise<PriceTableDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<PriceTableDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<PriceTableDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<PriceTableDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<PriceTableDto>,
    transactionReference?: TransactionReference,
  ): Promise<PriceTableDto | null>;

  abstract count(): Promise<number>;

  abstract getDefaultPriceTable(): Promise<PriceTableDto>;

  abstract getUserPriceTable(userId: string): Promise<PriceTableDto>;

  abstract getDetailedUserPriceTable(userId?: string): Promise<DetailedPriceTableDto>;

  abstract getPriceTable(userId?: string): Promise<PriceTableDto>;

  abstract getPriceTableProducts(userId?: string): Promise<ReadonlyArray<PriceTableProductDto>>;

  abstract getPlans(): Promise<PriceTablePlanDto[]>;
}
