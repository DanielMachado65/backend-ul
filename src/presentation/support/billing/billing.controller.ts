import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { BalanceEntity } from 'src/domain/_entity/balance.entity';
import { PaymentEntity } from 'src/domain/_entity/payment.entity';
import { QueryPriceTableTemplateItem } from 'src/domain/_entity/query-price-table.entity';
import {
  InsufficientCreditsDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { AccountFundsDto } from 'src/domain/_layer/data/dto/account-funds.dto';
import { CouponInfo } from 'src/domain/_layer/data/dto/coupon-info.dto';
import { CreditCardMinimalDto } from 'src/domain/_layer/data/dto/credit-card-minimal.dto';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { CreateCreditCardInputDto } from 'src/domain/_layer/presentation/dto/create-credit-card-input.dto';
import { CreditCardsWithSubscriptionsOutputDto } from 'src/domain/_layer/presentation/dto/credit-card-with-subscriptions.dto';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';
import { SearchHistoryDto } from 'src/domain/_layer/presentation/dto/search-query-hisotry.dto';
import {
  GetUserPaymentHistoryDomain,
  GetUserPaymentHistoryResult,
} from 'src/domain/core/query/get-user-payment-history.domain';
import { AddCreditCardDomain, AddCreditCardResult } from 'src/domain/support/billing/add-credit-card.domain';
import {
  GetUserAccountFundsDomain,
  GetUserCurrentAccountFundsDtoResult,
  GetUserCurrentAccountFundsResult,
} from 'src/domain/support/billing/get-user-account-funds.domain';
import {
  GetUserAllQueryPricesDomain,
  GetUserAllQueryPricesResult,
} from 'src/domain/support/billing/get-user-price-table.domain';
import {
  GiveCouponForNewUserDomain,
  GiveCouponForNewUserResult,
} from 'src/domain/support/billing/give-coupon-for-new-users';
import { ListCreditCardsDomain, ListCreditCardsResult } from 'src/domain/support/billing/list-credit-cards.domain';
import { RemoveCreditCardDomain, RemoveCreditCardResult } from 'src/domain/support/billing/remove-credit-card.domain';
import { ApiList } from 'src/infrastructure/framework/swagger/schemas/list.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { UserAgentUtil } from 'src/infrastructure/util/user-agent.util';
import {
  CantIssueInvoiceDomainError,
  InactiveBillingDomainError,
  NoBalanceFoundDomainError,
  NoPriceTableFoundDomainError,
  ProductUnavailableToUserDomainError,
  ProviderUnavailableDomainError,
  UserAlreadyBoughtDomainError,
} from '../../../domain/_entity/result.error';
import { DetailedPriceTableTemplate } from '../../../domain/_layer/data/dto/price-table.dto';
import { AddUserCreditsInputDto } from '../../../domain/_layer/presentation/dto/add-user-credits-input.dto';
import { ChargeUserInputDto } from '../../../domain/_layer/presentation/dto/charge-user-input.dto';
import { ChargebackUserInputDto } from '../../../domain/_layer/presentation/dto/chargeback-user-input.dto';
import { DeductUserCreditsInputDto } from '../../../domain/_layer/presentation/dto/deduct-user-credits-input.dto';
import { GetQueryPriceInputDto } from '../../../domain/_layer/presentation/dto/get-query-price-input.dto';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { AddUserCreditsDomain, AddUserCreditsResult } from '../../../domain/support/billing/add-user-credits.domain';
import {
  ChargeUserForQueryDomain,
  ChargeUserResult,
} from '../../../domain/support/billing/charge-user-for-query.domain';
import { ChargebackUserDomain, ChargebackUserResult } from '../../../domain/support/billing/chargeback-user.domain';
import {
  DeductUserCreditsDomain,
  DeductUserCreditsResult,
} from '../../../domain/support/billing/deduct-user-credits.domain';
import { GetQueryPriceDomain, GetQueryPriceResult } from '../../../domain/support/billing/get-query-price.domain';
import {
  GetUserCurrentBalanceDomain,
  GetUserCurrentBalanceResult,
} from '../../../domain/support/billing/get-user-current-balance.domain';
import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UserInfo } from '../../../infrastructure/middleware/user-info.middleware';

class PaymentReturn extends PaginationOf<PaymentDto> {
  @ApiProperty({ type: [PaymentEntity] })
  override items: ReadonlyArray<PaymentEntity>;
}

@ApiTags('Cobrança')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly _addUserCreditsDomain: AddUserCreditsDomain,
    private readonly _chargeUserForQueryDomain: ChargeUserForQueryDomain,
    private readonly _chargebackUserDomain: ChargebackUserDomain,
    private readonly _deductUserCreditsDomain: DeductUserCreditsDomain,
    private readonly _getQueryPriceDomain: GetQueryPriceDomain,
    private readonly _getUserCurrentBalanceDomain: GetUserCurrentBalanceDomain,
    private readonly _getUserAccountFunds: GetUserAccountFundsDomain,
    private readonly _getUserPaymentHistory: GetUserPaymentHistoryDomain,
    private readonly _getUserAllQueryPricesDomain: GetUserAllQueryPricesDomain,
    private readonly _giveCouponForNewUserDomain: GiveCouponForNewUserDomain,
    private readonly _addCreditCardDomain: AddCreditCardDomain,
    private readonly _listCreditCardsDomain: ListCreditCardsDomain,
    private readonly _removeCreditCardDomain: RemoveCreditCardDomain,
    private readonly _userAgentUtil: UserAgentUtil,
  ) {}

  @Post('/deduct-credits')
  @ApiBearerAuth()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Deduct credits from a user' })
  @ApiOkResponseMake(BalanceEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError, InsufficientCreditsDomainError])
  @Roles([UserRoles.ADMIN])
  deductUserCredits(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: DeductUserCreditsInputDto,
  ): Promise<DeductUserCreditsResult> {
    const assignerUserId: string = userInfo.maybeUserId ?? '';
    return this._deductUserCreditsDomain
      .deductUserCredits(inputDto.valueInCents, inputDto.userId, assignerUserId)
      .safeRun();
  }

  @Post('/add-credits')
  @ApiBearerAuth()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Add credits to a user' })
  @ApiOkResponseMake(BalanceEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError])
  @Roles([UserRoles.ADMIN])
  addUserCredits(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: AddUserCreditsInputDto,
  ): Promise<AddUserCreditsResult> {
    const assignerUserId: string = userInfo.maybeUserId ?? '';
    return this._addUserCreditsDomain.addUserCredits(inputDto.valueInCents, inputDto.userId, assignerUserId).safeRun();
  }

  @Get('/query-price/:queryCode')
  @ApiOperation({ summary: 'Return specific query price' })
  @ApiOkResponseMake(QueryPriceTableTemplateItem)
  @ApiErrorResponseMake([UnknownDomainError, NoPriceTableFoundDomainError, ProductUnavailableToUserDomainError])
  @Roles([UserRoles.GUEST])
  getQueryPrice(
    @UserInfo() userInfo: UserInfo,
    @Param() inputDto: GetQueryPriceInputDto,
  ): Promise<GetQueryPriceResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getQueryPriceDomain.getQueryPrice(inputDto.queryCode, userId).safeRun();
  }

  @Get('/query-price')
  @ApiOperation({ summary: 'Return all query prices' })
  @ApiOkResponseMake(ApiList(DetailedPriceTableTemplate))
  @ApiErrorResponseMake([UnknownDomainError, NoPriceTableFoundDomainError, ProductUnavailableToUserDomainError])
  @Roles([UserRoles.GUEST, UserRoles.REGULAR, UserRoles.ADMIN])
  getUserAllQueryPrices(@UserInfo() userInfo: UserInfo, @Req() req: Request): Promise<GetUserAllQueryPricesResult> {
    const userAgent: string = req.headers['user-agent'];
    const isMobile: boolean = this._userAgentUtil.isMobile(userAgent);
    return this._getUserAllQueryPricesDomain.getUserAllQueryPrice(userInfo.maybeUserId, isMobile).safeRun();
  }

  @Get('/current-balance')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Return user's current balance` })
  @ApiOkResponseMake(BalanceEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoBalanceFoundDomainError])
  @Roles([UserRoles.REGULAR])
  getUserCurrentBalance(@UserInfo() userInfo: UserInfo): Promise<GetUserCurrentBalanceResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getUserCurrentBalanceDomain.getUserCurrentBalance(userId).safeRun();
  }

  @Get('/account-funds')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Return user's account funds` })
  @ApiOkResponseMake(AccountFundsDto)
  @ApiErrorResponseMake(NoUserFoundDomainError)
  @Roles([UserRoles.REGULAR])
  async getUserAccountFunds(@UserInfo() userInfo: UserInfo): Promise<GetUserCurrentAccountFundsDtoResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    const accountFundsEither: GetUserCurrentAccountFundsResult = await this._getUserAccountFunds
      .getUserAccountFunds(userId)
      .safeRun();
    return accountFundsEither.map((funds: number) => ({ accountFunds: funds }));
  }

  @Get('/payment-history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return a list of payment history' })
  @ApiOkResponseMake(PaymentReturn)
  @ApiErrorResponseMake(UnknownDomainError)
  @Roles([UserRoles.REGULAR])
  async getUserPaymentHistory(
    @UserInfo() userInfo: UserInfo,
    @Query() { page, perPage }: PaginationInputDto,
    @Query() { search }: SearchHistoryDto,
  ): Promise<GetUserPaymentHistoryResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return await this._getUserPaymentHistory.getUserPaymentHistory(userId, page, perPage, search).safeRun();
  }

  @Post('/charge-user')
  @ApiBearerAuth()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Charge user for query' })
  @ApiOkResponseMake(BalanceEntity)
  @ApiErrorResponseMake([
    UnknownDomainError,
    NoPriceTableFoundDomainError,
    NoUserFoundDomainError,
    InactiveBillingDomainError,
    ProductUnavailableToUserDomainError,
    InsufficientCreditsDomainError,
    CantIssueInvoiceDomainError,
  ])
  @Roles([UserRoles.ADMIN])
  chargeUserForQuery(@UserInfo() userInfo: UserInfo, @Body() inputDto: ChargeUserInputDto): Promise<ChargeUserResult> {
    return this._chargeUserForQueryDomain.chargeUserForQuery(inputDto.userId, inputDto.queryCode).safeRun();
  }

  @Post('/chargeback-user')
  @ApiBearerAuth()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Chargeback user' })
  @ApiOkResponseMake(BalanceEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError, NoBalanceFoundDomainError])
  @Roles([UserRoles.ADMIN])
  chargebackUser(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: ChargebackUserInputDto,
  ): Promise<ChargebackUserResult> {
    return this._chargebackUserDomain.chargebackUser(inputDto.balanceId).safeRun();
  }

  @Get('/new-user-coupon')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon for new user' })
  @ApiOkResponseMake(CouponInfo)
  @ApiErrorResponseMake([UnknownDomainError, UserAlreadyBoughtDomainError])
  @Roles([UserRoles.REGULAR])
  getNewUserCoupon(@UserInfo() userInfo: UserInfo): Promise<GiveCouponForNewUserResult> {
    return this._giveCouponForNewUserDomain.giveTheCouponForUser(userInfo.maybeUserId).safeRun();
  }

  @Post('/credit-card')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Add credit card to user's payment methods` })
  @ApiOkResponseMake(CreditCardMinimalDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  addCreditCard(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: CreateCreditCardInputDto,
  ): Promise<AddCreditCardResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._addCreditCardDomain.addCreditCard(userId, inputDto.creditCard).safeRun();
  }

  @Get('/credit-card')
  @ApiBearerAuth()
  @ApiOperation({ summary: `List all user's credit card` })
  @ApiOkResponseMake(CreditCardsWithSubscriptionsOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  listCreditCards(@UserInfo() userInfo: UserInfo): Promise<ListCreditCardsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._listCreditCardsDomain.listAll(userId).safeRun();
  }

  @Delete('/credit-card/:creditCardId')
  @ApiBearerAuth()
  @ApiOperation({ summary: `Remove user's credit card if there's no subscription related` })
  @ApiOkResponseMake(CreditCardMinimalDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  deleteCreditCard(
    @UserInfo() userInfo: UserInfo,
    @Param('creditCardId') creditCardId: string,
  ): Promise<RemoveCreditCardResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._removeCreditCardDomain.remove(userId, creditCardId).safeRun();
  }
}
