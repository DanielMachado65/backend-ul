import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponseMake,
  ApiOkResponseMake,
} from '../../../infrastructure/framework/swagger/setup/swagger-builders';
import { ApiList } from '../../../infrastructure/framework/swagger/schemas/list.schema';
import { Controller, Get, Query } from '@nestjs/common';
import { GetPartnerIncomingInputDto } from '../../../domain/_layer/presentation/dto/get-partner-incoming-input.dto';
import { IncomingGroupedByCouponDto } from '../../../domain/_layer/data/dto/incoming-grouped-by-coupon.dto';
import {
  PartnerIncomingDomain,
  PartnerIncomingsResult,
} from '../../../domain/support/partner/get-partner-incomings.domain';
import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UnknownDomainError } from '../../../domain/_entity/result.error';
import { UserInfo } from '../../../infrastructure/middleware/user-info.middleware';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';

@ApiTags('Parceiro')
@Controller('partner')
export class PartnerController {
  constructor(private readonly _partnerIncomingDomain: PartnerIncomingDomain) {}

  @ApiBearerAuth()
  @Get('/incomings')
  @ApiOperation({ summary: 'get all partner incomings from a given date' })
  @ApiOkResponseMake(ApiList(IncomingGroupedByCouponDto))
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  getPartnerIncomings(
    @UserInfo() userInfo: UserInfo,
    @Query() inputQuery: GetPartnerIncomingInputDto,
  ): Promise<PartnerIncomingsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._partnerIncomingDomain.getPartnerIncomings(userId, inputQuery.month, inputQuery.year).safeRun();
  }
}
