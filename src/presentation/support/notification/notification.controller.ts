import { Either } from '@alissonfpmorais/minimal_fp';
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationEntity } from 'src/domain/_entity/notification.entity';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { AppTokenRegisteredDto } from 'src/domain/_layer/data/dto/app-token-registered.dto';
import { GetNotificationsQueryInputDto } from 'src/domain/_layer/presentation/dto/get-notifications-query-input.dto';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';
import { RegisterAppTokenInputDto } from 'src/domain/_layer/presentation/dto/register-app-token-input.dto';
import { SoftDeleteNotificationOutputDto } from 'src/domain/_layer/presentation/dto/soft-delete-notification-output.dto';
import { SoftDeleteNotificationsInputDto } from 'src/domain/_layer/presentation/dto/soft-delete-notifications-input.dto';
import { SoftDeleteNotificationsOutputDto } from 'src/domain/_layer/presentation/dto/soft-delete-notifications-output.dto';
import { UnseenCountNotificationsOutputDto } from 'src/domain/_layer/presentation/dto/unseen-count-notifications-output.dto';
import { UpdateNotificationInputDto } from 'src/domain/_layer/presentation/dto/update-notification-input.dto';
import { UpdateNotificationOutputDto } from 'src/domain/_layer/presentation/dto/update-notification-output.dto';
import { UpdateNotificationsInputDto } from 'src/domain/_layer/presentation/dto/update-notifications-input.dto';
import { UpdateNotificationsOutputDto } from 'src/domain/_layer/presentation/dto/update-notifications-output.dto';
import { UserRoles } from 'src/domain/_layer/presentation/roles/user-roles.enum';
import {
  GetNotificationsDomain,
  GetNotificationsResult,
  UnseenCountNotificationsResult,
} from 'src/domain/support/notification/get-notifications.domain';
import {
  RegisterAppTokenDomain,
  RegisterAppTokenResult,
} from 'src/domain/support/notification/register-app-token.domain';
import {
  SoftDeleteNotificationsDomain,
  SoftDeleteNotificationsDomainErrors,
  SoftDeleteNotificationsResult,
} from 'src/domain/support/notification/soft-delete-notifications.domain';
import {
  UpdateNotificationsDomain,
  UpdateNotificationsDomainErrors,
  UpdateNotificationsResult,
} from 'src/domain/support/notification/update-notifications.domain';
import { ApiPagination } from 'src/infrastructure/framework/swagger/schemas/pagination.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';

@ApiTags('Notificação')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly _getNotifications: GetNotificationsDomain,
    private readonly _registerAppToken: RegisterAppTokenDomain,
    private readonly _softDeleteNotifications: SoftDeleteNotificationsDomain,
    private readonly _updateNotifications: UpdateNotificationsDomain,
  ) {}

  @Post('/token')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Register new user's token` })
  @ApiOkResponseMake(AppTokenRegisteredDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  registerAppToken(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: RegisterAppTokenInputDto,
  ): Promise<RegisterAppTokenResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._registerAppToken.addToken(userId, inputDto.appToken).safeRun();
  }

  @Get('/')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Get all user's notifications filtered and paginated` })
  @ApiOkResponseMake(ApiPagination(NotificationEntity))
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  getNotifications(
    @UserInfo() userInfo: UserInfo,
    @Query() { page, perPage }: PaginationInputDto,
    @Query() { channel }: GetNotificationsQueryInputDto,
  ): Promise<GetNotificationsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getNotifications.getPaginated(userId, channel, page, perPage).safeRun();
  }

  @Get('/unseen-count')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Get notifications that was unseen for a user's` })
  @ApiOkResponseMake(UnseenCountNotificationsOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  getNotificationsUnseenCount(@UserInfo() userInfo: UserInfo): Promise<UnseenCountNotificationsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getNotifications.getUnseenNotification(userId).safeRun();
  }

  @Put('/:notificationId')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Update a single user's notification` })
  @ApiOkResponseMake(UpdateNotificationOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  updateNotification(
    @UserInfo() userInfo: UserInfo,
    @Param('notificationId') notificationId: string,
    @Body() inputDto: UpdateNotificationInputDto,
  ): Promise<Either<UpdateNotificationsDomainErrors, UpdateNotificationOutputDto>> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._updateNotifications
      .updateNotifications(userId, [{ notificationId, wasSeen: inputDto.wasSeen }])
      .map(({ notifications }: UpdateNotificationsOutputDto) => notifications[0])
      .safeRun();
  }

  @Put('/')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Bulk update user's notifications` })
  @ApiOkResponseMake(UpdateNotificationsOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  updateNotifications(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: UpdateNotificationsInputDto,
  ): Promise<UpdateNotificationsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._updateNotifications.updateNotifications(userId, inputDto.notifications).safeRun();
  }

  @Delete('/:notificationId')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Delete a single user's notification` })
  @ApiOkResponseMake(SoftDeleteNotificationOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  softDeleteNotification(
    @UserInfo() userInfo: UserInfo,
    @Param('notificationId') notificationId: string,
  ): Promise<Either<SoftDeleteNotificationsDomainErrors, SoftDeleteNotificationOutputDto>> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._softDeleteNotifications
      .softDeleteNotifications(userId, [notificationId])
      .map(({ notifications }: SoftDeleteNotificationsOutputDto) => notifications[0])
      .safeRun();
  }

  @Delete('/')
  @Roles([UserRoles.REGULAR])
  @ApiBearerAuth()
  @ApiOperation({ summary: `Bulk delete user's notifications` })
  @ApiOkResponseMake(SoftDeleteNotificationsOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, ProviderUnavailableDomainError])
  softDeleteNotifications(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: SoftDeleteNotificationsInputDto,
  ): Promise<SoftDeleteNotificationsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._softDeleteNotifications.softDeleteNotifications(userId, inputDto.notificationIds).safeRun();
  }
}
