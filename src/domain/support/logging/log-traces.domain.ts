import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Trace } from '@alissonfpmorais/rastru';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { SpanLogDto } from 'src/domain/_layer/data/dto/span-log.dto';

export type LogTraceDomainErrors = UnknownDomainError;

export type LogTraceResult = Either<LogTraceDomainErrors, ReadonlyArray<SpanLogDto>>;

export type LogTraceIO = EitherIO<LogTraceDomainErrors, ReadonlyArray<SpanLogDto>>;

export abstract class LogTracesDomain {
  abstract execute(trace: Trace): LogTraceIO;
}
