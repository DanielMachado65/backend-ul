import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConfigureAlertFipePriceDto } from 'src/domain/_layer/data/dto/configure-alert-fipe-price.dto';
import { GetAlertOnQueryConfigErrors } from './get-alert-on-query-config.domain';

export type ConfigureAlertFipePriceErrors = UnknownDomainError;

export type ConfigureAlertFipePriceResult = Either<GetAlertOnQueryConfigErrors, ConfigureAlertFipePriceDto>;

export type ConfigureAlertFipePriceIO = EitherIO<ConfigureAlertFipePriceErrors, ConfigureAlertFipePriceDto>;

export abstract class ConfigureAlertFipePriceDomain {
  abstract configure(carId: string, userId: string, config: ConfigureAlertFipePriceDto): ConfigureAlertFipePriceIO;
}
