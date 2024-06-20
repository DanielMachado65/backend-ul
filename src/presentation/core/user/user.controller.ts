import { Either } from '@alissonfpmorais/minimal_fp';
import { Body, Controller, Get, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  EmailAlreadyInUseByAnotherUserDomainError,
  InvalidCredentialsDomainError,
  InvalidPostalCodeDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnauthorizedExceptionDomainError,
  UnknownDomainError,
  UserAlreadyExistsDomainError,
  WebhookMaxLimitError,
} from 'src/domain/_entity/result.error';
import { CompleteUserConsent } from 'src/domain/_entity/user-consents.entity';
import { CaptchaKind } from 'src/domain/_layer/infrastructure/captcha/captcha.guard';
import { DeviceInfoData, DeviceKind } from 'src/domain/_layer/infrastructure/middleware/device-info.middleware';
import { UserUtilizationLogService } from 'src/domain/_layer/infrastructure/service/user-utilization-log.service';
import { CancelUserDeletionInputDto } from 'src/domain/_layer/presentation/dto/cancel-user-deletion-input.dto';
import { CreateUserWebhookInputDto } from 'src/domain/_layer/presentation/dto/create-user-webhook-input.dto';
import { GiveUserConsentInputDto } from 'src/domain/_layer/presentation/dto/give-user-consent-input.dto';
import { ListUserWebhooksOutputDto } from 'src/domain/_layer/presentation/dto/list-user-webhooks-output.dto';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';
import { SetUserToDeletionInputDto } from 'src/domain/_layer/presentation/dto/set-user-to-deletion-input.dto';
import { UpdateUserConsentInputDto } from 'src/domain/_layer/presentation/dto/update-user-consent-input.dto';
import { UpdateUserProfileInputDto } from 'src/domain/_layer/presentation/dto/update-user-profile-input.dto';
import { UserLogDto } from 'src/domain/_layer/presentation/dto/user-log-output.dto';
import { WhenUserDeletedDto } from 'src/domain/_layer/presentation/dto/when-user-deleted-output.dto';
import { CancelUserDeletionDomain, CancelUserDeletionResult } from 'src/domain/core/user/cancel-user-deletion.domain';
import { CreateUserWebhookDomain, CreateUserWebhookResult } from 'src/domain/core/user/create-user-webhook.domain';
import { DownloadUserLogsDomain, DownloadUserLogsResult } from 'src/domain/core/user/download-user-logs.domain';
import {
  GetPaginatedUserLogsDomain,
  GetPaginatedUserLogsResult,
} from 'src/domain/core/user/get-paginated-user-logs.domain';
import { GetUserConsentsDomain, GetUserConsentsResult } from 'src/domain/core/user/get-user-consents.domain';
import { GetUserDataInSheetDomain } from 'src/domain/core/user/get-user-data-in-sheet.domain';
import { GetUserProfileDomain } from 'src/domain/core/user/get-user-profile.domain';
import { GetWhenUserDeletedDomain, GetWhenUserDeletedResult } from 'src/domain/core/user/get-when-user-deleted.domain';
import { GiveConsentDomain, GiveConsentResult } from 'src/domain/core/user/give-consent.domain';
import {
  GiveOrRemoveConsentDomain,
  GiveOrRemoveConsentResult,
} from 'src/domain/core/user/give-or-remove-consent.domain';
import { ListWebhooksDomain, ListWebhooksResult } from 'src/domain/core/user/list-webhooks.domain';
import {
  SetUserToDeletionDomain,
  SetUserToDeletionDomainErrors,
} from 'src/domain/core/user/set-user-to-deletion.domain';
import { UpdateUserProfileDomain, UpdateUserProfileResult } from 'src/domain/core/user/update-user.domain';
import { RecheckUserAuthDomain, RecheckUserAuthErrors } from 'src/domain/support/auth/recheck-user-auth.domain';
import { UseUtilizationLog } from 'src/infrastructure/decorators/log-utilization.decorator';
import { ApiPagination } from 'src/infrastructure/framework/swagger/schemas/pagination.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Captcha } from 'src/infrastructure/guard/captcha.guard';
import { ReqParentId } from 'src/infrastructure/middleware/http-log.middleware';
import { JwtUtil } from 'src/infrastructure/util/jwt.util';
import { TokenEntity } from '../../../domain/_entity/token.entity';
import { UserEntity } from '../../../domain/_entity/user.entity';
import { SignUpInputDto } from '../../../domain/_layer/presentation/dto/sign-up-input-dto';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { AddUserDomain, AddUserResult } from '../../../domain/core/user/add-user.domain';
import { GetUserProfileResult, UserProfile } from '../../../domain/core/user/get-user-profile.domain';
import { GetUserDomain, GetUserResult } from '../../../domain/core/user/get-user.domain';
import { Roles } from '../../../infrastructure/guard/roles.guard';
import { DeviceInfo } from '../../../infrastructure/middleware/device-info.middleware';
import { UserInfo } from '../../../infrastructure/middleware/user-info.middleware';

@ApiTags('Usuário')
@Controller('user')
export class UserController {
  constructor(
    private readonly _addUserDomain: AddUserDomain,
    private readonly _getUserDomain: GetUserDomain,
    private readonly _getUserProfileDomain: GetUserProfileDomain,
    private readonly _updateUserProfileDomain: UpdateUserProfileDomain,
    private readonly _setUserToDeletionDomain: SetUserToDeletionDomain,
    private readonly _cancelUserDeletionDomain: CancelUserDeletionDomain,
    private readonly _recheckUserAuthDomain: RecheckUserAuthDomain,
    private readonly _getUserDataInSheetDomain: GetUserDataInSheetDomain,
    private readonly _downloadUserLogsDomain: DownloadUserLogsDomain,
    private readonly _getPaginatedUserLogsDomain: GetPaginatedUserLogsDomain,
    private readonly _getUserConsentsDomain: GetUserConsentsDomain,
    private readonly _giveOrRemoveConsentDomain: GiveOrRemoveConsentDomain,
    private readonly _getWhenUserDeletedDomain: GetWhenUserDeletedDomain,
    private readonly _userUtilizationLogService: UserUtilizationLogService,
    private readonly _giveConsentDomain: GiveConsentDomain,
    private readonly _createUserWebhookDomain: CreateUserWebhookDomain,
    private readonly _listWebhooksDomain: ListWebhooksDomain,
    private readonly _jwtUtil: JwtUtil,
  ) {}

  @Post('/signup')
  @Roles([UserRoles.GUEST])
  @ApiOperation({ summary: 'Create new user' })
  @ApiOkResponseMake(TokenEntity)
  @ApiErrorResponseMake([UnknownDomainError, UserAlreadyExistsDomainError, InvalidPostalCodeDomainError])
  @Captcha({
    captchaKinds: {
      [DeviceKind.COMPUTER]: [CaptchaKind.GOOGLE_RECAPTCHA_V2],
      [DeviceKind.MOBILE]: [],
      [DeviceKind.UNKNOWN]: [CaptchaKind.GOOGLE_RECAPTCHA_V2],
    },
  })
  signUp(
    @ReqParentId() reqParentId: string,
    @Body() inputDto: SignUpInputDto,
    @DeviceInfo() deviceInfo: DeviceInfoData,
  ): Promise<AddUserResult> {
    return this._addUserDomain
      .addUser(inputDto, deviceInfo.deviceKind, reqParentId)
      .tap((token: TokenEntity) =>
        this._userUtilizationLogService.sendLog(
          this._jwtUtil.decodeToken<{ readonly id: string }>(token.token).id,
          'Cadastro de usuário',
          'Novo usuário cadastrado',
          null,
        ),
      )
      .safeRun();
  }

  @Get('/')
  @Roles([UserRoles.ADMIN])
  @ApiExcludeEndpoint()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return user' })
  @ApiOkResponseMake(UserEntity)
  @ApiErrorResponseMake([NoUserFoundDomainError, UnknownDomainError])
  getUser(@UserInfo() userInfo: UserInfo): Promise<GetUserResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getUserDomain.getUser(userId).safeRun();
  }

  @Get('/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return user profile' })
  @ApiOkResponseMake(UserProfile)
  @ApiErrorResponseMake([NoUserFoundDomainError, UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  getUserProfile(@UserInfo() userInfo: UserInfo): Promise<GetUserProfileResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getUserProfileDomain.getUserProfile(userId).safeRun();
  }

  @Put('/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponseMake(UserProfile)
  @ApiErrorResponseMake([
    EmailAlreadyInUseByAnotherUserDomainError,
    NoUserFoundDomainError,
    UnauthorizedExceptionDomainError,
    UnknownDomainError,
  ])
  @Roles([UserRoles.REGULAR])
  @UseUtilizationLog('Atualização de cadastro', 'Usuário alterou o telefone de contato')
  updateUserProfile(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: UpdateUserProfileInputDto,
  ): Promise<UpdateUserProfileResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._updateUserProfileDomain.updateUser(userId, inputDto).safeRun();
  }

  @Patch('/set-to-deletion')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set user data be deleted in a future' })
  @ApiOkResponseMake(UserProfile)
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError, InvalidCredentialsDomainError])
  @Roles([UserRoles.REGULAR])
  setToDelete(
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: SetUserToDeletionInputDto,
  ): Promise<Either<RecheckUserAuthErrors | SetUserToDeletionDomainErrors, UserProfile>> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._recheckUserAuthDomain
      .byId(userId, inputDto.password)
      .flatMap(() => this._setUserToDeletionDomain.setUserToDeletion(userId))
      .safeRun();
  }

  @Patch('/cancel-deletion')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Undo user deletion' })
  @ApiOkResponseMake(UserProfile)
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError])
  @Roles([UserRoles.GUEST])
  cancelDeletion(@Body() inputDto: CancelUserDeletionInputDto): Promise<CancelUserDeletionResult> {
    return this._cancelUserDeletionDomain.cancelByEmail(inputDto.email).safeRun();
  }

  @Get('/data/download')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sheet of user data' })
  @ApiResponse({
    status: 200,
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError])
  @Roles([UserRoles.REGULAR])
  async getDataSheet(@UserInfo() userInfo: UserInfo, @Res() res: Response): Promise<void | never> {
    const userId: string = userInfo.maybeUserId ?? '';
    const run: Either<unknown, Buffer> = await this._getUserDataInSheetDomain.getById(userId).safeRun();

    if (run.isRight()) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-disposition', 'attachment; filename=dados.xlsx');
      res.send(run.getRight());
    } else {
      throw run.getLeft();
    }
  }

  @Get('/log')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logs' })
  @ApiOkResponseMake(ApiPagination(UserLogDto))
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  getLogs(
    @UserInfo() userInfo: UserInfo,
    @Query() { page, perPage }: PaginationInputDto,
  ): Promise<GetPaginatedUserLogsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getPaginatedUserLogsDomain.getPaginated(userId, page, perPage).safeRun();
  }

  @Get('/log/download')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'download logs' })
  @ApiResponse({
    status: 200,
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  async downloadLogs(@UserInfo() userInfo: UserInfo, @Res() res: Response): Promise<void | never> {
    const userId: string = userInfo.maybeUserId ?? '';
    const run: DownloadUserLogsResult = await this._downloadUserLogsDomain.getAll(userId).safeRun();

    if (run.isRight()) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-disposition', 'attachment; filename=utilization-logs.xlsx');
      res.send(run.getRight());
    } else {
      throw run.getLeft();
    }
  }

  @Get('/consent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user consents' })
  @ApiOkResponseMake(CompleteUserConsent)
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  getUserConsents(@UserInfo() userInfo: UserInfo): Promise<GetUserConsentsResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getUserConsentsDomain.getConsents(userId).safeRun();
  }

  @Put('/consent/:consentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user consent' })
  @ApiOkResponseMake(CompleteUserConsent)
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  updateUserConsents(
    @UserInfo() userInfo: UserInfo,
    @Param('consentId') consentId: string,
    @Body() inputDto: UpdateUserConsentInputDto,
  ): Promise<GiveOrRemoveConsentResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._giveOrRemoveConsentDomain.toggle(consentId, userId, inputDto.hasGivenConsent).safeRun();
  }

  @Post('/consent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Give zapay concent' })
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  giveConsent(@UserInfo() userInfo: UserInfo, @Body() body: GiveUserConsentInputDto): Promise<GiveConsentResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    const consentId: string = body.consentId ?? '';
    return this._giveConsentDomain.create(userId, consentId, body).safeRun();
  }

  @Get('/when-deleted')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get when user deleted' })
  @ApiOkResponseMake(WhenUserDeletedDto)
  @ApiOkResponseMake(ListUserWebhooksOutputDto)
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError])
  @Roles([UserRoles.REGULAR])
  whenDeleted(@UserInfo() userInfo: UserInfo): Promise<GetWhenUserDeletedResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getWhenUserDeletedDomain.get(userId).safeRun();
  }

  @Get('/webhook')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all webhooks created' })
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.REGULAR])
  listWebhooks(@UserInfo() userInfo: UserInfo): Promise<ListWebhooksResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._listWebhooksDomain.execute(userId).safeRun();
  }

  @Put('/webhook')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update a user webhook' })
  @ApiErrorResponseMake([UnknownDomainError, WebhookMaxLimitError])
  @ApiOkResponseMake(ListUserWebhooksOutputDto)
  @Roles([UserRoles.REGULAR])
  createUserWebhook(
    @UserInfo() userInfo: UserInfo,
    @Body() body: CreateUserWebhookInputDto,
  ): Promise<CreateUserWebhookResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._createUserWebhookDomain.execute(userId, body.webhookUrls).safeRun();
  }
}
