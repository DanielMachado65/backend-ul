import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  NoPriceTableFoundDomainError,
  ProductUnavailableToUserDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { DetailedPriceTableTemplate } from 'src/domain/_layer/data/dto/price-table.dto';
import { UserRoles } from 'src/domain/_layer/presentation/roles/user-roles.enum';
import { GetPlansDomain, GetPlansResult } from 'src/domain/support/billing/get-plans.domain';
import {
  GetPriceTableProductsDomain,
  GetPriceTableProductsDomainResult,
} from 'src/domain/support/billing/get-price-table-products.domain';
import { ApiList } from 'src/infrastructure/framework/swagger/schemas/list.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';

@Controller('price-table')
export class PriceTableController {
  constructor(
    private readonly _getPriceTableProductsDomain: GetPriceTableProductsDomain,
    private readonly _getPlansDomain: GetPlansDomain,
  ) {}

  @Get('/products')
  @ApiOperation({ summary: 'Return all query prices' })
  @ApiOkResponseMake(ApiList(DetailedPriceTableTemplate))
  @ApiErrorResponseMake([UnknownDomainError, NoPriceTableFoundDomainError, ProductUnavailableToUserDomainError])
  @Roles([UserRoles.GUEST, UserRoles.REGULAR, UserRoles.ADMIN])
  getUserAllQueryPrices(@Query('userId') userId?: string): Promise<GetPriceTableProductsDomainResult> {
    return this._getPriceTableProductsDomain.getProducts(userId).safeRun();
  }

  @Get('/plans')
  @ApiOperation({ summary: 'Return all query prices' })
  @ApiOkResponseMake(ApiList(DetailedPriceTableTemplate))
  @ApiErrorResponseMake([UnknownDomainError, NoPriceTableFoundDomainError, ProductUnavailableToUserDomainError])
  @Roles([UserRoles.GUEST, UserRoles.REGULAR, UserRoles.ADMIN])
  getYear(): Promise<GetPlansResult> {
    return this._getPlansDomain.getPlans().safeRun();
  }
}
