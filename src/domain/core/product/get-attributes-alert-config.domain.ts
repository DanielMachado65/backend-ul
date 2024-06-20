import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { CarNotFoundError, NotMongoIdError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';

export type ConfigureAlerResultDto = Partial<MyCarProductDto>;

export type GetAlertConfigErrors = UnknownDomainError | CarNotFoundError;
export type GetFineConfigErrors = UnknownDomainError | CarNotFoundError | NotMongoIdError;

export type GetAlertConfigResult = Either<GetAlertConfigErrors, ConfigureAlerResultDto>;
export type GetFineConfigResult = Either<GetFineConfigErrors, ConfigureAlerResultDto>;

export type GetConfigIO = EitherIO<GetAlertConfigErrors, ConfigureAlerResultDto>;

export interface IGetAttributesAlertConfig {
  readonly includes?: ReadonlyArray<string>;
  readonly only?: ReadonlyArray<string>;
}

export abstract class GetAttributesMyCarProductDomain {
  abstract getAttributes(carId: string, userId: string, attributes: IGetAttributesAlertConfig): GetConfigIO;
}
