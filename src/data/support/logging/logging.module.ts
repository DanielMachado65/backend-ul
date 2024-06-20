import { Module, Provider } from '@nestjs/common';
import { LogHttpRequestsDomain } from 'src/domain/support/logging/log-http-requests.domain';
import { LogTracesDomain } from 'src/domain/support/logging/log-traces.domain';
import { LogHttpRequestsUseCase } from './log-http-requests.use-case';
import { LogTracesUseCase } from './log-traces.use-case';

const providers: ReadonlyArray<Provider> = [
  { provide: LogHttpRequestsDomain, useClass: LogHttpRequestsUseCase },
  { provide: LogTracesDomain, useClass: LogTracesUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...providers],
  exports: [...providers],
})
export class LoggingDataLayerModule {}
