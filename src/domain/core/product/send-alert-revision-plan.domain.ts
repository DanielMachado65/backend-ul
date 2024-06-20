import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';

export type SendAlertRevisionErrors = UnknownDomainError | CarNotFoundError;

export type SendAlertRevisionResult = Either<SendAlertRevisionErrors, boolean>;

export type SendAlertRevisionIO = EitherIO<SendAlertRevisionErrors, boolean>;

export type SendNotificationDefinition = {
  readonly byEmail: ReadonlyArray<MyCarProductWithUserDto>;
  readonly byApp: ReadonlyArray<MyCarProductWithUserDto>;
};

export abstract class SendAlertRevisionPlanDomain {
  abstract execute(): SendAlertRevisionIO;
}
