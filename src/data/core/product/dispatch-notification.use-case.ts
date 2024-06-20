import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NotValidEvent, UnknownDomainError } from 'src/domain/_entity/result.error';
import { NotificationIdentifier } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import {
  DispatchNotificationDomain,
  DispatchNotificationIO,
} from 'src/domain/core/product/dispatch-notification.domain';
import { SendAlertFineDomain } from 'src/domain/core/product/send-alert-fine.domain';
import { SendAlertFipePriceDomain, SendAlertFipePriceIO } from 'src/domain/core/product/send-alert-fipe-price.domain';
import {
  SendAlertRevisionIO,
  SendAlertRevisionPlanDomain,
} from 'src/domain/core/product/send-alert-revision-plan.domain';

@Injectable()
export class DispatchNotificationUseCase implements DispatchNotificationDomain {
  constructor(
    private readonly _sendAlertRevisionPlanDomain: SendAlertRevisionPlanDomain,
    private readonly _sendAlertFineDomain: SendAlertFineDomain,
    private readonly _sendAlertFipePriceDomain: SendAlertFipePriceDomain,
  ) {}

  send(event: NotificationIdentifier): DispatchNotificationIO {
    return EitherIO.of(UnknownDomainError.toFn(), event)
      .filter(NotValidEvent.toFn(), this._isValidEvent())
      .map((event: NotificationIdentifier) => {
        switch (event) {
          case NotificationIdentifier.QUERY_REVISION_PLAN:
            return this.sendQueryRevisionPlan().unsafeRun();

          case NotificationIdentifier.QUERY_FINE:
            return this.sendQueryfine().unsafeRun();

          case NotificationIdentifier.QUERY_FIPE_PRICE:
            return this.sendAlertFipePrice().unsafeRun();

          default:
            throw NotValidEvent.toFn();
        }
      });
  }

  sendQueryRevisionPlan(): SendAlertRevisionIO {
    return this._sendAlertRevisionPlanDomain.execute();
  }

  sendQueryfine(): SendAlertRevisionIO {
    return this._sendAlertFineDomain.execute();
  }

  sendAlertFipePrice(): SendAlertFipePriceIO {
    return this._sendAlertFipePriceDomain.execute();
  }

  private _isValidEvent() {
    return (event: NotificationIdentifier): boolean => {
      return [
        NotificationIdentifier.QUERY_REVISION_PLAN,
        NotificationIdentifier.QUERY_FINE,
        NotificationIdentifier.QUERY_FIPE_PRICE,
      ].includes(event);
    };
  }
}
