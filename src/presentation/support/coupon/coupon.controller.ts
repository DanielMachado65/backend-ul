import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponseMake,
  ApiOkResponseMake,
} from '../../../infrastructure/framework/swagger/setup/swagger-builders';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CountCouponsCreatedByUserDomain,
  CountCouponsCreatedByUserResult,
} from 'src/domain/support/coupon/count-coupons-created-by-user.domain';
import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UnknownDomainError } from '../../../domain/_entity/result.error';
import { UserInfo } from '../../../infrastructure/middleware/user-info.middleware';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { CouponEntity } from 'src/domain/_entity/coupon.entity';
import { ValidateCouponResult, ValidateCouponUserDomain } from 'src/domain/support/coupon/validate-coupon-user.domain';
import { CouponProductsInputDto } from 'src/domain/_layer/presentation/dto/coupon-products-input.dto';

@ApiTags('Coupon')
@Controller('coupon')
export class CouponController {
  constructor(
    private readonly _countCouponsCreatedByUserDomain: CountCouponsCreatedByUserDomain,
    private readonly _validateCouponUserDomain: ValidateCouponUserDomain,
  ) {}

  @ApiBearerAuth()
  @Get('/count-created')
  @ApiOperation({ summary: 'get total count of coupons created by a given user' })
  @ApiOkResponseMake({ schema: { type: 'number' }, usedDtos: [] })
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  getAllUsedCoupon(@UserInfo() userInfo: UserInfo): Promise<CountCouponsCreatedByUserResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._countCouponsCreatedByUserDomain.countCouponsCreatedByUser(userId).safeRun();
  }

  @Post('/v2/validate/:code')
  @ApiOperation({ summary: 'Validate coupon code' })
  @ApiOkResponseMake(CouponEntity, { description: 'Validate coupon', status: 200 })
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.GUEST])
  validateCoupon(
    @Param('code') code: string,
    @Body()
    body: CouponProductsInputDto,
  ): Promise<ValidateCouponResult> {
    return this._validateCouponUserDomain.call(code, body).safeRun();
  }
}
