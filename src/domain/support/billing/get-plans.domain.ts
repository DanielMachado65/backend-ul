import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PriceTablePlanDto } from 'src/domain/_layer/data/dto/price-table.dto';

export type GetPlansDomainErrors = UnknownDomainError;

export type GetPlansResult = Either<GetPlansDomainErrors, PriceTablePlanDto[]>;

export type GetPlansIO = EitherIO<GetPlansDomainErrors, PriceTablePlanDto[]>;

export abstract class GetPlansDomain {
  abstract getPlans(): GetPlansIO;
}
