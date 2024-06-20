import { Either } from '@alissonfpmorais/minimal_fp';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

type Req = {
  readonly httpLogId: string;
  readonly httpLogStartAt: string;
  readonly route: { readonly path: string };
};

type RequestMetadata = {
  readonly httpLogId: string | null;
  readonly httpLogStartAt: string | null;
  readonly path: string | null;
};

type HttpResponse = {
  readonly __meta__: {
    readonly requestId: string;
    readonly path: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly processingTime: string;
  };
  readonly data: unknown;
};

@Injectable()
export class EitherTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { httpLogId, httpLogStartAt, path }: RequestMetadata =
      EitherTransformInterceptor._getRequestMetadata(context);
    return next.handle().pipe(
      map(EitherTransformInterceptor._makeResponse(httpLogId, httpLogStartAt, path)),
      tap((response: HttpResponse) => {
        try {
          const res: Record<string, unknown> = context.switchToHttp().getResponse();
          res['httpLogResBody'] = response;
        } catch (_error) {
          // Noop
        }
      }),
    );
  }

  private static _getRequestMetadata(context: ExecutionContext): RequestMetadata {
    let path: string = null;
    let httpLogId: string = null;
    let httpLogStartAt: string = null;

    try {
      const req: Req = context.switchToHttp().getRequest();
      path = req?.route?.path;
      httpLogId = req?.httpLogId;
      httpLogStartAt = req?.httpLogStartAt;
    } catch (_error) {
      // Noop
    }

    return { httpLogId, httpLogStartAt, path };
  }

  private static _makeResponse(
    httpLogId: string,
    httpLogStartAt: string,
    path: string,
  ): (response: unknown) => unknown {
    return (response: unknown) => {
      const endTime: string = new Date().toISOString();

      if (!(response instanceof Either)) return response;
      if (response.isRight())
        return EitherTransformInterceptor._makeHttpResponse(
          httpLogId,
          httpLogStartAt,
          path,
          endTime,
          response.getRight(),
        );
      throw (response as Either<unknown, unknown>).getLeft();
    };
  }

  private static _makeHttpResponse(
    httpLogId: string,
    httpLogStartAt: string,
    path: string,
    endTime: string,
    response: unknown,
  ): HttpResponse {
    return {
      __meta__: {
        requestId: httpLogId,
        path: path,
        startTime: httpLogStartAt,
        endTime: endTime,
        processingTime: httpLogStartAt ? `${new Date(endTime).getTime() - new Date(httpLogStartAt).getTime()}ms` : '-1',
      },
      data: response,
    };
  }
}
