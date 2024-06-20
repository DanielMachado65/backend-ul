import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { VersionAppControlInputDto } from 'src/domain/_layer/data/dto/version-app-control.dto';
import { UserRoles } from 'src/domain/_layer/presentation/roles/user-roles.enum';
import {
  VersionAppContolDomain,
  VersionAppContolResult,
} from 'src/domain/support/app-control/version-app-control.domain';
import { ApiErrorResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';

@ApiTags('Controle do APP')
@Controller('app-control')
export class AppControlContoller {
  constructor(private readonly _versionAppContolDomain: VersionAppContolDomain) {}

  @Post('/version-upgrade')
  @Roles([UserRoles.GUEST])
  @ApiOperation({ summary: 'Check current version required for use mobile app' })
  @ApiErrorResponseMake([UnknownDomainError])
  @ApiOkResponse({ schema: { example: { isForceUpgrade: true } } })
  isForceUpgrade(@Body() body: VersionAppControlInputDto): Promise<VersionAppContolResult> {
    return this._versionAppContolDomain.validate(body).safeRun();
  }
}
