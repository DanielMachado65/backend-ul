import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConfigureAlertFipePriceDto } from 'src/domain/_layer/data/dto/configure-alert-fipe-price.dto';

export type GetAlertOnQueryConfigErrors = UnknownDomainError | CarNotFoundError;

export type GetAlertFipePriceConfigResult = Either<GetAlertOnQueryConfigErrors, ConfigureAlertFipePriceDto>;

export type GetAlertFipePriceConfigIO = EitherIO<GetAlertOnQueryConfigErrors, ConfigureAlertFipePriceDto>;

export abstract class GetAlertFipePriceConfigDomain {
  abstract load(carId: string, userId: string): GetAlertFipePriceConfigIO;
}
