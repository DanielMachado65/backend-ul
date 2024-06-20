/* eslint-disable functional/no-return-void,@typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { appEvents, AppEvents } from 'src/domain/_layer/infrastructure/service/event/app-events.types';
import { EventEmitterService } from '../../domain/_layer/infrastructure/service/event/event.service';
import { StringUtil } from '../util/string.util';

class AppEventDispatcher {
  constructor(_proto: unknown, _eventEmitter: EventEmitter2) {
    Object.keys(appEvents).forEach(<EventListener extends AppEvents>(event: EventListener) => {
      // eslint-disable-next-line functional/immutable-data
      _proto[`dispatch${StringUtil.toPascalCase(event)}`] = function (payload: EventListener): void {
        _eventEmitter.emitAsync(event, payload).finally();
      };
    });
  }
}

@Injectable()
export class NestEventEmitterService extends AppEventDispatcher implements EventEmitterService {
  constructor(private readonly _eventEmitter: EventEmitter2) {
    super(NestEventEmitterService.prototype, _eventEmitter);
  }
}
