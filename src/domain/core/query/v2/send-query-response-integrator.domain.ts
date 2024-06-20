import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';

export type SendQueryNotificationDomainErrors = UnknownDomainError;

export type SendQueryNotificationResult = Either<SendQueryNotificationDomainErrors, void>;

export type SendQueryNotificationIO = EitherIO<SendQueryNotificationDomainErrors, void>;

export abstract class SendQueryNotificationDomain {
  readonly execute: (queryDto: QueryDto) => SendQueryNotificationIO;
}
