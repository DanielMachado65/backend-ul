import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConfigureAlertOnQueryDto } from 'src/domain/_layer/data/dto/configure-alert-on-query.dto';

export type GetAlertOnQueryConfigErrors = UnknownDomainError | CarNotFoundError;

export type GetAlertOnQueryConfigResult = Either<GetAlertOnQueryConfigErrors, ConfigureAlertOnQueryDto>;

export type GetAlertOnQueryConfigIO = EitherIO<GetAlertOnQueryConfigErrors, ConfigureAlertOnQueryDto>;

export abstract class GetAlertOnQueryConfigDomain {
  abstract load(carId: string, userId: string): GetAlertOnQueryConfigIO;
}
