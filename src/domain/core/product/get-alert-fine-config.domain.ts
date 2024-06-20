import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { CarNotFoundError, NotMongoIdError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { FineAlertConfigurationInputDto } from 'src/domain/_layer/presentation/dto/product-feature-configuration-input.dto';

export type GetAlertRevisionPlanConfigDto = FineAlertConfigurationInputDto;

export type GetFineErrors = UnknownDomainError | CarNotFoundError | NotMongoIdError;

export type GetFineResult = Either<GetFineErrors, GetAlertRevisionPlanConfigDto>;
export type GetFineIO = EitherIO<GetFineErrors, GetAlertRevisionPlanConfigDto>;

export abstract class GetFineMyCarProductDomain {
  abstract getFineConfig(carId: string, userId: string): GetFineIO;
}
