import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { DataNotFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CaptchaKind } from 'src/domain/_layer/infrastructure/captcha/captcha.guard';
import { DeviceKind } from 'src/domain/_layer/infrastructure/middleware/device-info.middleware';
import { GetTestDriveParamInputDto } from 'src/domain/_layer/presentation/dto/get-test-drive-input.dto';
import { RequestTestDriveInputDto } from 'src/domain/_layer/presentation/dto/request-test-drive-input.dto';
import { UpdateCountTestDriveInputDto } from 'src/domain/_layer/presentation/dto/update-count-test-drive-input.dto';
import { UserRoles } from 'src/domain/_layer/presentation/roles/user-roles.enum';
import { GetTestDriveDomain, GetTestDriveResult } from 'src/domain/core/query/get-test-drive.domain';
import {
  GetTotalTestsDrivesDomain,
  GetTotalTestsDrivesResult,
} from 'src/domain/core/query/v2/get-total-tests-drives.domain';
import { RequestTestDriveDomain, RequestTestDriveResult } from 'src/domain/core/query/v2/request-test-drive.domain';
import {
  UpdateCountTestDriveDomain,
  UpdateCountTestDriveResult,
} from 'src/domain/core/query/v2/update-count-test-drive.domain';
import { ApiErrorResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Captcha } from 'src/infrastructure/guard/captcha.guard';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';

@ApiBearerAuth()
@ApiTags('Test Drive')
@Controller('/v2/test-drive')
export class TestDriveController {
  constructor(
    private readonly _requestTestDriveDomain: RequestTestDriveDomain,
    private readonly _getTestDriveDomain: GetTestDriveDomain,
    private readonly _getTotalTestsDrivesDomain: GetTotalTestsDrivesDomain,
    private readonly _updateCountTestDriveDomain: UpdateCountTestDriveDomain,
  ) {}

  @Post('/')
  @ApiOperation({ summary: 'request a test drive' })
  @ApiErrorResponseMake([UnknownDomainError, DataNotFoundDomainError])
  @Captcha({
    captchaKinds: {
      [DeviceKind.COMPUTER]: [CaptchaKind.GOOGLE_RECAPTCHA_V2],
      [DeviceKind.MOBILE]: [],
      [DeviceKind.UNKNOWN]: [CaptchaKind.GOOGLE_RECAPTCHA_V2],
    },
  })
  @Roles([UserRoles.GUEST])
  requestTestDrive(
    @UserInfo() userInfo: UserInfo,
    @Req() request: Request,
    @Body() inputDto: RequestTestDriveInputDto,
  ): Promise<RequestTestDriveResult> {
    const ip: string = request.ip;
    const mayBeUser: string = userInfo.maybeUserId || null;
    return this._requestTestDriveDomain.requestTestDrive(inputDto.keys, ip, mayBeUser, inputDto.userCity).safeRun();
  }

  @Put('/total')
  @Roles([UserRoles.GUEST])
  updateCountTestDrive(@Body() inputDto: UpdateCountTestDriveInputDto): Promise<UpdateCountTestDriveResult> {
    return this._updateCountTestDriveDomain.execute(inputDto.token).safeRun();
  }

  @Get('/total')
  @ApiOperation({ summary: 'get total of tests drives' })
  @ApiErrorResponseMake([UnknownDomainError])
  @Roles([UserRoles.GUEST])
  getTotaTestsDrives(): Promise<GetTotalTestsDrivesResult> {
    return this._getTotalTestsDrivesDomain.execute().safeRun();
  }

  @Get('/:queryId')
  @ApiOperation({ summary: 'request a test drive' })
  @ApiErrorResponseMake([UnknownDomainError, DataNotFoundDomainError])
  @Roles([UserRoles.GUEST])
  getTestDrive(@Param() { queryId }: GetTestDriveParamInputDto): Promise<GetTestDriveResult> {
    return this._getTestDriveDomain.getTestDrive(queryId).safeRun();
  }
}
