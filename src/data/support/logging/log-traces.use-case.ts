import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { SpanItem, Trace } from '@alissonfpmorais/rastru';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { SpanLogDto } from 'src/domain/_layer/data/dto/span-log.dto';
import { SpanLogRepository } from 'src/domain/_layer/infrastructure/repository/span-log.repository';
import { LogTraceIO, LogTracesDomain } from 'src/domain/support/logging/log-traces.domain';

@Injectable()
export class LogTracesUseCase implements LogTracesDomain {
  constructor(private readonly _spanLogRepo: SpanLogRepository) {}

  execute(trace: Trace): LogTraceIO {
    return EitherIO.of(UnknownDomainError.toFn(), trace)
      .map(LogTracesUseCase._toSpanLogs)
      .map((spans: ReadonlyArray<SpanLogDto>) => this._spanLogRepo.insertMany(spans))
      .catch((_error: unknown) => Either.right([]));
  }

  private static _toSpanLogs(trace: Trace): ReadonlyArray<SpanLogDto> {
    return trace.spans.map((span: SpanItem) => ({
      traceId: trace.traceId,
      traceName: trace.traceName,
      targetName: span.targetName,
      startAt: span.startTime,
      endAt: span.endTime,
      spanTime: span.spanTime,
      isSuccess: span.isSuccess,
      params: span.params,
      response: span.response,
    }));
  }
}
