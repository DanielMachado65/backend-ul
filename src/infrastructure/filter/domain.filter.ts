import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Request, Response } from 'express';
import {
  DomainError,
  IRequestError,
  SentryDomainError,
  cleanUpDomainError,
  isDomainError,
} from '../../domain/_entity/result.error';

type BadRequestValidationErrors = {
  readonly message: unknown;
};

@Catch()
export class DomainFilter implements ExceptionFilter {
  constructor(@InjectSentry() private readonly _client: SentryService) {}

  private static _getBadRequestDetails(exception: unknown): DomainError {
    try {
      if (!(exception instanceof BadRequestException))
        return { tag: 'UNKNOWN_ERROR', description: 'Unknown error', errorLevel: 'error' };
      const response: BadRequestValidationErrors = exception.getResponse() as BadRequestValidationErrors;
      return response.message
        ? {
            tag: 'INVALID_REQUEST_DATA',
            description: 'Invalid request data',
            errorLevel: 'error',
            details: { message: response.message },
          }
        : { tag: 'UNKNOWN_ERROR', description: 'Unknown error', errorLevel: 'error' };
    } catch (error) {
      return { tag: 'UNKNOWN_ERROR', description: 'Unknown error', errorLevel: 'error' };
    }
  }

  // eslint-disable-next-line functional/no-return-void
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request & { readonly httpLogId: string; readonly httpLogStartAt: string } = ctx.getRequest();

    const status: number =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const domainError: DomainError | null = isDomainError(exception) ? cleanUpDomainError(exception) : null;
    const details: DomainError = DomainFilter._getBadRequestDetails(exception);

    let eventId: string = null;
    if (domainError?.errorLevel && domainError?.errorLevel !== 'none') {
      const error: SentryDomainError = new SentryDomainError(domainError);
      eventId = this._client.instance().captureException(error, { level: domainError.errorLevel, extra: { ...error } });
    } else if (domainError === null) {
      eventId = this._client.instance().captureException(exception, { level: 'error' });
    }

    const endTime: string = new Date().toISOString();

    const draftBody: IRequestError = {
      requestId: request.httpLogId,
      errorId: eventId,
      statusCode: status,
      startTime: request.httpLogStartAt,
      endTime: endTime,
      processingTime: `${new Date(endTime).getTime() - new Date(request.httpLogStartAt).getTime()}ms`,
      path: request.url,
      ...details,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { internalDetails, errorLevel, ...body }: IRequestError & { readonly errorLevel?: string } = domainError
      ? { ...draftBody, ...domainError }
      : draftBody;

    try {
      response['httpLogResBody'] = body;
    } catch (_error) {
      // Noop
    }

    response.status(status).json(body);
  }
}
