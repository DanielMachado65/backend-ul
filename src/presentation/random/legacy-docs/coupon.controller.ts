import { Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiGoneResponse,
  ApiMethodNotAllowedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';

class Package {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;
}

class Query {
  @ApiProperty()
  code: number;

  @ApiProperty()
  amount: number;
}

class Products {
  @ApiProperty({ type: [Package] })
  packages: ReadonlyArray<Package>;

  @ApiProperty({ type: [Query] })
  queries: ReadonlyArray<Query>;
}

class Coupon {
  @ApiProperty()
  userId: string;

  @ApiProperty({ type: () => Products })
  items: Products;
}

class CouponResult {
  @ApiProperty()
  coupon: string;

  @ApiProperty()
  discountValue: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  totalPriceWithoutDiscount: number;

  @ApiProperty({ type: [Package] })
  packages: ReadonlyArray<Package>;

  @ApiProperty({ type: [Query] })
  queries: ReadonlyArray<Query>;
}

class CouponResponse {
  @ApiProperty({ type: () => CouponResult })
  result: CouponResult;
}

class CouponSuccess {
  @ApiProperty()
  code: number;

  @ApiProperty({ type: () => CouponResponse })
  data: CouponResponse;
}

class CouponError {
  @ApiProperty()
  status: number;

  @ApiProperty()
  body: string;
}

@ApiTags('Cobrança')
@Controller('coupon')
export class CouponController {
  @Post('validate/:code')
  @ApiBody({ type: () => Coupon })
  @ApiOperation({ summary: 'Validate coupon code (Legacy)' })
  @ApiOkResponse({ description: 'Validate coupon', type: CouponSuccess })
  @ApiGoneResponse({ description: 'Error during coupon validation', type: CouponError })
  @ApiMethodNotAllowedResponse({ description: 'Invalid body', type: CouponError })
  @Roles([UserRoles.GUEST])
  validateCoupon(): Promise<null> {
    return Promise.resolve(null);
  }
}
