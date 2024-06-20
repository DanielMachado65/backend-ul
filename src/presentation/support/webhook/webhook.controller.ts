import { Either } from '@alissonfpmorais/minimal_fp';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentGatewayType } from 'src/domain/_entity/payment.entity';
import { NoEventMatchingFoundDomainError } from 'src/domain/_entity/result.error';
import {
  ArcWebhookDto,
  PaymentUpdatedArcWebhookDto,
  SubscriptionUpdatedArcWebhookDto,
} from 'src/domain/_layer/data/dto/arc-webhook.dto';
import { SyncWithExternalSubscriptionDomain } from 'src/domain/support/billing/sync-with-external-subscription.domain';
import { SyncWithExternalPaymentDomain } from 'src/domain/support/payment/sync-with-external-payment.domain';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { ReqParentId } from 'src/infrastructure/middleware/http-log.middleware';
import { ClassValidatorUtil } from 'src/infrastructure/util/class-validator.util';
import { ApiRoles } from '../../../domain/_layer/presentation/roles/api-roles.enum';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly _classValidatorUtil: ClassValidatorUtil,
    private readonly _syncWithExternalPayment: SyncWithExternalPaymentDomain,
    private readonly _syncWithExternalSubscription: SyncWithExternalSubscriptionDomain,
  ) {}

  @Post('/arc')
  @Roles([ApiRoles.ARC_PAYMENT_GATEWAY])
  @ApiOperation({ summary: 'receive webhook payloads' })
  arc(@ReqParentId() reqParentId: string, @Body() body: ArcWebhookDto<unknown>): Promise<Either<unknown, unknown>> {
    switch (body.event) {
      case 'payment_updated':
        return this._classValidatorUtil
          .validateAndResult(body, PaymentUpdatedArcWebhookDto)
          .flatMap(({ payload }: PaymentUpdatedArcWebhookDto) =>
            this._syncWithExternalPayment.syncWithExternalReference(
              payload.payment_id,
              payload.idempotence,
              PaymentGatewayType.ARC,
              reqParentId,
            ),
          )
          .safeRun();

      case 'subscription_updated':
        return this._classValidatorUtil
          .validateAndResult(body, SubscriptionUpdatedArcWebhookDto)
          .flatMap(({ payload }: SubscriptionUpdatedArcWebhookDto) =>
            this._syncWithExternalSubscription.syncWithExternalReference(payload.subscription_id, payload.idempotence),
          )
          .safeRun();

      default:
        return WebhookController._noEventMatching();
    }
  }

  private static async _noEventMatching(): Promise<Either<NoEventMatchingFoundDomainError, never>> {
    return Either.left(new NoEventMatchingFoundDomainError());
  }
}
