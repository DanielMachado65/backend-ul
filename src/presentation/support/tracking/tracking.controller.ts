import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PartnerInteractionDto } from 'src/domain/_layer/data/dto/partner-interaction.dto';
import { TrackPaymentInitPayloadDto } from 'src/domain/_layer/data/dto/track-payment-init-payload.dto';
import { UserRoles } from 'src/domain/_layer/presentation/roles/user-roles.enum';
import { TrackCheckoutInitDomain } from 'src/domain/support/payment/track-checkout-init.domain';
import { TrackPartnerInteractionDomain } from 'src/domain/support/tracking/track-partner-interaction.domain';
import { ApiErrorResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly _trackCheckoutInitDomain: TrackCheckoutInitDomain,
    private readonly _trackPartnerInteractionDomain: TrackPartnerInteractionDomain,
  ) {}

  @ApiBearerAuth()
  @Post('/checkout-init')
  @ApiOperation({ summary: 'track checkout init' })
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  @HttpCode(204)
  async trackPaymentInit(@Body() input: TrackPaymentInitPayloadDto, @UserInfo() userInfo: UserInfo): Promise<void> {
    await this._trackCheckoutInitDomain.track(userInfo.maybeUserId, input).unsafeRun();
  }

  @ApiBearerAuth()
  @Post('/partner-interaction')
  @ApiOperation({ summary: 'track partner interaction' })
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  @HttpCode(204)
  async trackPartnerInteraction(@Body() params: PartnerInteractionDto, @UserInfo() userInfo: UserInfo): Promise<void> {
    const userId: string = userInfo.maybeUserId ?? '';
    await this._trackPartnerInteractionDomain.track(userId, params.queryId, params.link).unsafeRun();
  }
}
