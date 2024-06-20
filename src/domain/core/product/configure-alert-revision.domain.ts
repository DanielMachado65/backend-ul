import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { RevisionAlertConfigurationInputDto } from 'src/domain/_layer/presentation/dto/product-feature-configuration-input.dto';

export type ConfigureAlertRevisionDto = RevisionAlertConfigurationInputDto;

export type ConfigureAlertRevisionDomainErros =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError;

export type ConfigureAlertRevisionResult = Either<ConfigureAlertRevisionDomainErros, ConfigureAlertRevisionDto>;

export type ConfigureAlertRevisionIO = EitherIO<ConfigureAlertRevisionDomainErros, ConfigureAlertRevisionDto>;

export abstract class ConfigureAlertRevisionDomain {
  abstract configure(carId: string, userId: string, config: ConfigureAlertRevisionDto): ConfigureAlertRevisionIO;
}
