/* eslint-disable */
import { OnEvent } from '@nestjs/event-emitter';
import { OnEventOptions } from '@nestjs/event-emitter/dist/interfaces';
import { Inject, Type } from '@nestjs/common';
import { AppEvents, appEvents } from '../../domain/_layer/infrastructure/service/event/app-events.types';
import { StringUtil } from '../util/string.util';
import { EVENT_EMITTER_SERVICE } from '../../domain/_layer/infrastructure/service/event/event.service';
import { EitherIO } from '@alissonfpmorais/minimal_fp';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Listen(event: string, options?: OnEventOptions): MethodDecorator {
  return OnEvent(event, options);
}

// eslint-disable-next-line functional/no-return-void,@typescript-eslint/naming-convention
export function AppEventListener(): (constructor: Type) => void {
  // eslint-disable-next-line functional/no-return-void
  return function (constructor: Type): void {
    const proto: unknown = constructor.prototype;
    Object.keys(appEvents).forEach((event: AppEvents) => {
      const propertyKey: string = `on${StringUtil.toPascalCase(event)}`;
      const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(proto, propertyKey);
      const value: Function = descriptor?.value;
      Object.defineProperty(proto, propertyKey, {
        value: async function (payload: unknown): Promise<void> {
          try {
            const promises: ReadonlyArray<Promise<unknown>> = value
              .bind(this)(payload)
              .map((eitherIO: EitherIO<unknown, unknown>) =>
                eitherIO
                  .safeRun()
                  .catch(() => undefined)
                  .finally(),
              );
            await Promise.allSettled(promises);
          } catch (_error) {
            /**
             * Improve error handling, by enabling failed events (use cases) to be reprocessed
             * This may need some engineering like elixir's oban library, node's bull, etc
             */
          }
        },
        writable: true,
        configurable: true,
        enumerable: false,
      });

      Listen(event)(proto, propertyKey, Object.getOwnPropertyDescriptor(proto, propertyKey));
    });
  };
}

// eslint-disable-next-line functional/no-return-void,@typescript-eslint/ban-types,@typescript-eslint/naming-convention
export function AppEventDispatcher(): (target: object, key: string | symbol, index?: number) => void {
  return Inject(EVENT_EMITTER_SERVICE);
}
