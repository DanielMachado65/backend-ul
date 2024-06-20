// noinspection JSUnusedGlobalSymbols

import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { HttpRequestFinishedEvent } from 'src/domain/_event/http-request-finished.event';
import { PaymentSucceededEvent } from 'src/domain/_event/payment-succeeded.event';
import { QueryFailureEvent } from 'src/domain/_event/query-failure.event';
import { QuerySucceededEvent } from 'src/domain/_event/query-succeeded.event';
import { TraceCollectedEvent } from 'src/domain/_event/trace-collected.event';
import { TransactionCreditsCreatedEvent } from 'src/domain/_event/transaction-credits-created.event';
import { AppEvents, AppPayloadEvent } from 'src/domain/_layer/infrastructure/service/event/app-events.types';
import { SendAlertOnQueryDomain } from 'src/domain/core/product/send-alert-on-query.domain';
import { AutomateQueryDomain } from 'src/domain/core/query/automate-query.domain';
import { SendQueryNotificationDomain } from 'src/domain/core/query/v2/send-query-response-integrator.domain';
import { AddUserAtPaymentGatewayDomain } from 'src/domain/core/user/add-user-at-payment-gateway.domain';
import { AutomateUserDomain } from 'src/domain/core/user/automate-user.domain';
import { AddUserCreditsDomain } from 'src/domain/support/billing/add-user-credits.domain';
import { LogHttpRequestsDomain } from 'src/domain/support/logging/log-http-requests.domain';
import { LogTracesDomain } from 'src/domain/support/logging/log-traces.domain';
import { SendQueryToMarketingDomain } from 'src/domain/support/marketing/send-query-to-marketing.domain';
import { AutomatePaymentDomain } from 'src/domain/support/payment/automate-payment.domain';
import { LoginSucceededEvent } from '../../../domain/_event/login-succeeded.event';
import { UserCreatedEvent } from '../../../domain/_event/user-created.event';
import { SendPaymentToEmailMarketingDomain } from '../../../domain/support/marketing/send-payment-to-email-marketing.domain';
import { AddIndicatedPaymentDomain } from '../../../domain/support/partner/add-indicator-incoming.domain';
import { AddPartnerIncomingDomain } from '../../../domain/support/partner/add-partner-incoming.domain';
import { CreateNfeDomain } from '../../../domain/support/payment/create-nfe.domain';
import { AppEventListener } from '../../../infrastructure/decorators/events.decorator';
import { PascalCase } from '../../../infrastructure/util/string.util';

type ListenerController = {
  readonly [EventListener in AppEvents as `on${PascalCase<EventListener>}`]: (
    payload: AppPayloadEvent<EventListener>,
  ) => ReadonlyArray<EitherIO<unknown, unknown>>;
};

@Injectable()
@AppEventListener()
export class EventListener implements ListenerController {
  constructor(
    private readonly _addIndicatedPayment: AddIndicatedPaymentDomain,
    private readonly _addPartnerIncomingDomain: AddPartnerIncomingDomain,
    private readonly _addUserAtPaymentGatewayDomain: AddUserAtPaymentGatewayDomain,
    private readonly _addUserCreditsDomain: AddUserCreditsDomain,
    private readonly _createNfeDomain: CreateNfeDomain,
    private readonly _sendPaymentToEmailMarketingDomain: SendPaymentToEmailMarketingDomain,
    private readonly _sendQueryToMarketingDomain: SendQueryToMarketingDomain,
    private readonly _sendAlertOnQueryDomain: SendAlertOnQueryDomain,
    private readonly _logHttpRequestsDomain: LogHttpRequestsDomain,
    private readonly _sendQueryNotificationDomain: SendQueryNotificationDomain,
    private readonly _logTracesDomain: LogTracesDomain,
    private readonly _automateQueryDomain: AutomateQueryDomain,
    private readonly _automateUserDomain: AutomateUserDomain,
    private readonly _automatePaymentDomain: AutomatePaymentDomain,
  ) {}

  onLoginSucceeded(payload: LoginSucceededEvent): ReadonlyArray<EitherIO<unknown, unknown>> {
    return [this._addUserAtPaymentGatewayDomain.addUserAtGateway(payload.userId, payload.reqParentId)];
  }

  onPaymentSucceeded(payload: PaymentSucceededEvent): ReadonlyArray<EitherIO<unknown, unknown>> {
    return [
      this._addIndicatedPayment.addIndicatedPayment(payload.paymentId),
      this._addPartnerIncomingDomain.addPartnerIncoming(payload.paymentId),
      this._addUserCreditsDomain.addUserCreditsFromPayment(payload.paymentId),
      this._createNfeDomain.createNfe(payload.paymentId),
      this._sendPaymentToEmailMarketingDomain.send(payload.paymentId),
      this._automatePaymentDomain.execute(payload.paymentId),
    ];
  }

  onUserCreated(payload: UserCreatedEvent): ReadonlyArray<EitherIO<unknown, unknown>> {
    return [
      this._addUserAtPaymentGatewayDomain.addUserAtGateway(payload.userId, payload.reqParentId),
      this._automateUserDomain.execute(payload.user),
    ];
  }

  onQuerySucceeded(payload: QuerySucceededEvent): ReadonlyArray<EitherIO<unknown, unknown>> {
    return [
      this._sendQueryToMarketingDomain.send(payload.queryId),
      this._sendAlertOnQueryDomain.send(payload.userId, payload.keys),
      this._sendQueryNotificationDomain.execute(payload.queryDto),
      this._automateQueryDomain.saveResponseQuery(payload.queryDto),
    ];
  }

  onQueryFailure(payload: QueryFailureEvent): ReadonlyArray<EitherIO<unknown, unknown>> {
    return [this._sendQueryNotificationDomain.execute(payload.queryDto)];
  }

  onHttpRequestFinished(payload: HttpRequestFinishedEvent): ReadonlyArray<EitherIO<unknown, unknown>> {
    return [this._logHttpRequestsDomain.execute(payload.httpLog)];
  }

  onTraceCollected(payload: TraceCollectedEvent): ReadonlyArray<EitherIO<unknown, unknown>> {
    return [this._logTracesDomain.execute(payload.trace)];
  }

  onTransactionCreditsCreated(payload: TransactionCreditsCreatedEvent): ReadonlyArray<EitherIO<unknown, unknown>> {
    return [this._addUserCreditsDomain.addUserCredits(payload.valueInCents, payload.userId)];
  }
}
