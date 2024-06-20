import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { CreditCardInputDto } from 'src/domain/_layer/presentation/dto/credit-card-input.dto';
import { CreditCardsWithSubscriptionsOutputDto } from 'src/domain/_layer/presentation/dto/credit-card-with-subscriptions.dto';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';
import {
  SubscriptionOutputDto,
  SubscriptionRelatedDataDto,
} from 'src/domain/_layer/presentation/dto/subscription-output.dto';
import { UserRoles } from 'src/domain/_layer/presentation/roles/user-roles.enum';
import { CancelUserSubscriptionDomain } from 'src/domain/support/billing/cancel-user-subscription.domain';
import {
  ChangeSubscriptionCreditCardDomain,
  ChangeSubscriptionCreditCardResult,
} from 'src/domain/support/billing/change-subscription-credit-card.domain';
import {
  GetSubscriptionRelatedDataDomain,
  GetSubscriptionRelatedDataDomainErrors,
} from 'src/domain/support/billing/get-subscription-related-data.domain';
import {
  ExtraInfo,
  ListUserSubscriptionsDomain,
  ListUserSubscriptionsDomainErrors,
} from 'src/domain/support/billing/list-user-subscriptions.domain';
import { ApiPagination } from 'src/infrastructure/framework/swagger/schemas/pagination.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';

type GetAllSubscriptionsResult = Either<
  ListUserSubscriptionsDomainErrors & GetSubscriptionRelatedDataDomainErrors,
  PaginationOf<SubscriptionOutputDto>
>;

@ApiTags('Assinatura')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly _listUserSubscriptionDomain: ListUserSubscriptionsDomain,
    private readonly _cancelUserSubscriptionDomain: CancelUserSubscriptionDomain,
    private readonly _getSubscriptionRelatedDataDomain: GetSubscriptionRelatedDataDomain,
    private readonly _changeSubscriptionCreditCardDomain: ChangeSubscriptionCreditCardDomain,
  ) {}

  @Get('/')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `List all user's subscriptions filtered and paginated` })
  @ApiOkResponseMake(ApiPagination(SubscriptionOutputDto))
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  getAllSubscriptions(
    @UserInfo() userInfo: UserInfo,
    @Query() { page, perPage }: PaginationInputDto,
  ): Promise<GetAllSubscriptionsResult> {
    type Sub = SubscriptionDto & ExtraInfo;
    type Out = SubscriptionOutputDto;
    type Rel = SubscriptionRelatedDataDto;
    type PagSub = PaginationOf<Sub>;
    type PagOut = PaginationOf<Out>;
    type RelErrors = GetSubscriptionRelatedDataDomainErrors;
    type RelIO = EitherIO<RelErrors, PagOut>;

    const userId: string = userInfo.maybeUserId ?? '';
    return this._listUserSubscriptionDomain
      .listByUser(userId, page, perPage)
      .flatMap((data: PagSub): RelIO => {
        const subscriptionIds: ReadonlyArray<string> = data.items.map((item: Sub) => item.id);
        return this._getSubscriptionRelatedDataDomain
          .fromMultiple(userId, subscriptionIds)
          .map((multipleRelatedData: ReadonlyArray<Rel>): PagOut => {
            const output: ReadonlyArray<Out> = multipleRelatedData.map((relatedData: Rel, index: number): Out => {
              const subscription: Sub = data.items[index];
              return {
                plan: subscription.plan,
                relatedData: relatedData,
                creditCardLast4: subscription.creditCardLast4,
                creditCardId: subscription.creditCardId,
                id: subscription.id,
                userId: subscription.userId,
                status: subscription.status,
                planTag: subscription.planTag,
                lastChargeInCents: 0,
                deactivatedAt: subscription.deactivatedAt,
                nextChargeAt: subscription.nextChargeAt,
                expiresAt: subscription.expiresAt,
                createdAt: subscription.createdAt,
                updatedAt: subscription.updatedAt,
              };
            });

            return { ...data, items: output };
          });
      })
      .safeRun();
  }

  @Post('/:subscriptionId/cancel')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Cancel the given user's subscription` })
  @ApiOkResponseMake(SubscriptionOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  cancelSubscription(
    @UserInfo() userInfo: UserInfo,
    @Param('subscriptionId') subscriptionId: string,
  ): Promise<Either<unknown, SubscriptionOutputDto>> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._cancelUserSubscriptionDomain
      .cancelById(subscriptionId, userId)
      .map(
        (subscription: SubscriptionDto): SubscriptionOutputDto => ({
          plan: null, // TODO
          relatedData: null, // TODO
          creditCardLast4: null, // TODO
          creditCardId: null, // TODO
          id: subscription.id,
          userId: subscription.userId,
          status: subscription.status,
          planTag: subscription.planTag,
          lastChargeInCents: 0,
          deactivatedAt: subscription.deactivatedAt,
          nextChargeAt: subscription.nextChargeAt,
          expiresAt: subscription.expiresAt,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        }),
      )
      .safeRun();
  }

  @Put('/:subscriptionId/credit-card')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Change subscription's payment method` })
  @ApiOkResponseMake(CreditCardsWithSubscriptionsOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  changeCreditCardForSubscription(
    @UserInfo() userInfo: UserInfo,
    @Param('subscriptionId') subscriptionId: string,
    @Body() inputDto: CreditCardInputDto,
  ): Promise<ChangeSubscriptionCreditCardResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._changeSubscriptionCreditCardDomain
      .changeBySubscriptionId(subscriptionId, inputDto.creditCardId, userId)
      .safeRun();
  }
}
