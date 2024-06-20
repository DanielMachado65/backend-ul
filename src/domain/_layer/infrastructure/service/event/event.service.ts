import { AppEvents, AppPayloadEvent } from './app-events.types';
import { PascalCase } from '../../../../../infrastructure/util/string.util';

export const EVENT_EMITTER_SERVICE: string = 'EVENT_EMITTER_SERVICE';

export type EventEmitterService = {
  readonly [EventDispatcher in AppEvents as `dispatch${PascalCase<EventDispatcher>}`]: (
    payload: AppPayloadEvent<EventDispatcher>,
    // eslint-disable-next-line functional/no-return-void
  ) => void;
};
