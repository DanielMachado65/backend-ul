import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import * as packageJson from '../../../../package.json';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { ENV_KEYS, EnvService } from '../../../infrastructure/framework/env.service';
import { Roles } from '../../../infrastructure/guard/roles.guard';

class AppInfo {
  @ApiProperty()
  readonly elapsedTime: string;

  @ApiProperty()
  readonly environment: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly startTime: string;

  @ApiProperty()
  readonly version: string;
}

@ApiTags('Geral')
@Controller('health-check')
export class HealthCheckController {
  private readonly _startTimeNum: number;
  private readonly _startTime: string;

  constructor(private readonly _envService: EnvService) {
    const now: Date = new Date();
    this._startTimeNum = +now;
    this._startTime = now.toISOString();
  }

  @Get()
  @ApiOperation({ summary: 'get api version' })
  @ApiOkResponseMake(AppInfo)
  @Roles([UserRoles.GUEST])
  getAppInfo(): Promise<Either<UnknownDomainError, AppInfo>> {
    return EitherIO.of(UnknownDomainError.toFn(), {
      elapsedTime: this._getElapsedTime(),
      environment: this._envService.get(ENV_KEYS.NODE_ENV) as string,
      name: packageJson.name,
      startTime: this._startTime,
      version: `v${packageJson.version}`,
    }).safeRun();
  }

  private _getElapsedTime(): string {
    return `${(+new Date() - this._startTimeNum) / 1000} s`;
  }
}
