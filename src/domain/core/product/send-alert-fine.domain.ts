import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';

export type SendFineErrors = UnknownDomainError | CarNotFoundError;

export type SendAlertFineResult = Either<SendFineErrors, boolean>;

export type SendAlertFineIO = EitherIO<SendFineErrors, boolean>;

export type SendNotificationDefinition = {
  readonly byEmail: ReadonlyArray<MyCarProductWithUserDto>;
  readonly byApp: ReadonlyArray<MyCarProductWithUserDto>;
};

export abstract class SendAlertFineDomain {
  abstract execute(): SendAlertFineIO;
}
