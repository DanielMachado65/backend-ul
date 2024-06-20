import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { FineAlertConfigurationInputDto } from 'src/domain/_layer/presentation/dto/product-feature-configuration-input.dto';

export type ConfigureAlertFineDto = FineAlertConfigurationInputDto;

export type ConfigureAlertFineDomainErros =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError;

export type ConfigureAlertFineResult = Either<ConfigureAlertFineDomainErros, ConfigureAlertFineDto>;

export type ConfigureAlertFineIO = EitherIO<ConfigureAlertFineDomainErros, ConfigureAlertFineDto>;

export abstract class ConfigureAlertFineDomain {
  abstract configure(carId: string, userId: string, config: ConfigureAlertFineDto): ConfigureAlertFineIO;
}
