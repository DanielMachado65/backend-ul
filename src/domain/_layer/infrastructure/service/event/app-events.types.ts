import { HttpRequestFinishedEvent } from 'src/domain/_event/http-request-finished.event';
import { LoginSucceededEvent } from 'src/domain/_event/login-succeeded.event';
import { PaymentSucceededEvent } from 'src/domain/_event/payment-succeeded.event';
import { QueryFailureEvent } from 'src/domain/_event/query-failure.event';
import { QuerySucceededEvent } from 'src/domain/_event/query-succeeded.event';
import { TraceCollectedEvent } from 'src/domain/_event/trace-collected.event';
import { TransactionCreditsCreatedEvent } from 'src/domain/_event/transaction-credits-created.event';
import { UserCreatedEvent } from 'src/domain/_event/user-created.event';

export interface IAppEventPayloadMap {
  readonly LOGIN_SUCCEEDED: LoginSucceededEvent;
  readonly PAYMENT_SUCCEEDED: PaymentSucceededEvent;
  readonly USER_CREATED: UserCreatedEvent;
  readonly QUERY_SUCCEEDED: QuerySucceededEvent;
  readonly HTTP_REQUEST_FINISHED: HttpRequestFinishedEvent;
  readonly QUERY_FAILURE: QueryFailureEvent;
  readonly TRACE_COLLECTED: TraceCollectedEvent;
  readonly TRANSACTION_CREDITS_CREATED: TransactionCreditsCreatedEvent;
}

export const appEvents: Record<keyof IAppEventPayloadMap, keyof IAppEventPayloadMap> = {
  LOGIN_SUCCEEDED: 'LOGIN_SUCCEEDED',
  PAYMENT_SUCCEEDED: 'PAYMENT_SUCCEEDED',
  USER_CREATED: 'USER_CREATED',
  QUERY_SUCCEEDED: 'QUERY_SUCCEEDED',
  HTTP_REQUEST_FINISHED: 'HTTP_REQUEST_FINISHED',
  QUERY_FAILURE: 'QUERY_FAILURE',
  TRACE_COLLECTED: 'TRACE_COLLECTED',
  TRANSACTION_CREDITS_CREATED: 'TRANSACTION_CREDITS_CREATED',
};

export type AppEvents = keyof IAppEventPayloadMap;

export type AppPayloadEvent<Type extends AppEvents> = IAppEventPayloadMap[Type];
