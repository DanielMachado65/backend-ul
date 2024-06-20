// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable functional/no-return-void */
import { Injectable } from '@nestjs/common';
import { AppEvents, appEvents } from 'src/domain/_layer/infrastructure/service/event/app-events.types';
import { EventEmitterService } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { StringUtil } from 'src/infrastructure/util/string.util';

class AppEventDispatcher {
  constructor(_proto: unknown) {
    Object.keys(appEvents).forEach(<EventListener extends AppEvents>(event: EventListener) => {
      // eslint-disable-next-line functional/immutable-data
      _proto[`dispatch${StringUtil.toPascalCase(event)}`] = function (_payload: EventListener): void {};
    });
  }
}

@Injectable()
export class FakeEventEmitterService extends AppEventDispatcher implements EventEmitterService {
  constructor() {
    super(FakeEventEmitterService.prototype);
  }
}
