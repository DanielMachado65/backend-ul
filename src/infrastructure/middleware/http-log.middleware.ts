import { ExecutionContext, Injectable, NestMiddleware, createParamDecorator } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { EventEmitterService } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { AppEventDispatcher } from '../decorators/events.decorator';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ReqParentId: () => ParameterDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: { readonly httpLogId?: string } = ctx.switchToHttp().getRequest();
  return request['httpLogId'];
});

@Injectable()
export class HttpLogMiddleware implements NestMiddleware {
  constructor(@AppEventDispatcher() private readonly _eventEmitterService: EventEmitterService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    this._appendHttpLog(req, res);
    next();
  }

  private _appendHttpLog(req: Request, res: Response): void {
    try {
      const startAt: string = new Date().toISOString();
      const httpLogId: string = req.headers['x-request-id'] as string;

      req['httpLogStartAt'] = startAt;
      req['httpLogId'] = httpLogId;
      res.setHeader('x-request-id', httpLogId);

      res.on('finish', () => {
        this._eventEmitterService.dispatchHttpRequestFinished({
          httpLog: {
            id: httpLogId,
            parentId: null,
            target: 'uluru',
            actor: 'external',
            method: req.method,
            url: `${req.protocol}://${req.get('Host')}${req.originalUrl}`,
            statusCode: res.statusCode,
            requestHeaders: req.headers,
            requestParams: {
              queryParams: req.query,
              body: req.body,
            },
            responseHeaders: { ...res.getHeaders() },
            responseBody: res['httpLogResBody'],
            startAt: startAt,
            endAt: new Date().toISOString(),
          },
        });
      });
    } catch (_error) {
      // No op
    }
  }
}
