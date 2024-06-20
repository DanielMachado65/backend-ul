import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { CarNotFoundError, NotMongoIdError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { RevisionAlertConfigurationInputDto } from 'src/domain/_layer/presentation/dto/product-feature-configuration-input.dto';

export type GetAlertRevisionPlanConfigDto = RevisionAlertConfigurationInputDto;

export type GetRevisionConfigErrors = UnknownDomainError | CarNotFoundError | NotMongoIdError;

export type GetRevisionConfigResult = Either<GetRevisionConfigErrors, GetAlertRevisionPlanConfigDto>;
export type GetRevisionConfigIO = EitherIO<GetRevisionConfigErrors, GetAlertRevisionPlanConfigDto>;

export abstract class GetRevisionConfigMyCarProductDomain {
  abstract getRevisionPlanConfig(carId: string, userId: string): GetRevisionConfigIO;
}
