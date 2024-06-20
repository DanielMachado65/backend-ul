import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { ConfigureAlertOnQueryDto } from 'src/domain/_layer/data/dto/configure-alert-on-query.dto';

export type ConfigureAlertOnQueryDomainErros =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError;

export type ConfigureAlertOnQueryResult = Either<ConfigureAlertOnQueryDomainErros, ConfigureAlertOnQueryDto>;

export type ConfigureAlertOnQueryIO = EitherIO<ConfigureAlertOnQueryDomainErros, ConfigureAlertOnQueryDto>;

export abstract class ConfigureAlertOnQueryDomain {
  abstract configure(carId: string, userId: string, config: ConfigureAlertOnQueryDto): ConfigureAlertOnQueryIO;
}
