import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryKeys } from 'src/domain/_entity/query.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';

export type SendAlertOnQueryErrors = UnknownDomainError;

export type SendAlertOnQueryIO = EitherIO<SendAlertOnQueryErrors, void>;

export type NotifyMyCarsBy = {
  readonly byEmail: ReadonlyArray<MyCarProductWithUserDto>;
  readonly byApp: ReadonlyArray<MyCarProductWithUserDto>;
};

export abstract class SendAlertOnQueryDomain {
  abstract send(userId: string, keys: QueryKeys): SendAlertOnQueryIO;
}
