import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { HttpLogEntity } from 'src/domain/_entity/http-log.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { HttpLogDto } from 'src/domain/_layer/data/dto/http-log.dto';

export type LogHttpRequestsDomainErrors = UnknownDomainError;

export type LogHttpRequestsResult = Either<LogHttpRequestsDomainErrors, HttpLogEntity>;

export type LogHttpRequestsIO = EitherIO<LogHttpRequestsDomainErrors, HttpLogEntity>;

export abstract class LogHttpRequestsDomain {
  abstract execute(dto: HttpLogDto): LogHttpRequestsIO;
}
