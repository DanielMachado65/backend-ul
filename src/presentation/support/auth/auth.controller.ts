import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUtilizationLogService } from 'src/domain/_layer/infrastructure/service/user-utilization-log.service';
import { LoginInputDto } from 'src/domain/_layer/presentation/dto/login-input-dto';
import { SignInDomain, SignInResult } from 'src/domain/support/auth/sign-in.domain';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { ReqParentId } from 'src/infrastructure/middleware/http-log.middleware';
import { JwtUtil } from 'src/infrastructure/util/jwt.util';
import { None } from '../../../domain/_entity/none.entity';
import {
  InvalidCredentialsDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { TokenEntity } from '../../../domain/_entity/token.entity';
import { UserEntity } from '../../../domain/_entity/user.entity';
import { DeviceInfoData } from '../../../domain/_layer/infrastructure/middleware/device-info.middleware';
import { PasswordChangeInputDto } from '../../../domain/_layer/presentation/dto/password-change-input.dto';
import {
  PasswordRecoveryCpfInputDto,
  PasswordRecoveryEmailInputDto,
} from '../../../domain/_layer/presentation/dto/password-recovery-input.dto';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { PasswordChangeDomain, PasswordChangeResult } from '../../../domain/support/auth/password-change.domain';
import { PasswordRecoveryDomain, PasswordRecoveryResult } from '../../../domain/support/auth/password-recovery.domain';
import { DeviceInfo } from '../../../infrastructure/middleware/device-info.middleware';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _signInDomain: SignInDomain,
    private readonly _passwordRecovery: PasswordRecoveryDomain,
    private readonly _passwordChange: PasswordChangeDomain,
    private readonly _userUtilizationLogService: UserUtilizationLogService,
    private readonly _jwtUtil: JwtUtil,
  ) {}

  @Post(['/login', '/log-in'])
  @Roles([UserRoles.GUEST])
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiOkResponseMake(TokenEntity)
  @ApiErrorResponseMake([UnknownDomainError, InvalidCredentialsDomainError])
  login(
    @ReqParentId() reqParentId: string,
    @Body() inputDto: LoginInputDto,
    @DeviceInfo() deviceInfo: DeviceInfoData,
  ): Promise<SignInResult> {
    return this._signInDomain
      .signIn(inputDto.email, inputDto.password, deviceInfo.deviceKind, reqParentId)
      .tap((token: TokenEntity) =>
        this._userUtilizationLogService.sendLog(
          this._jwtUtil.decodeToken<{ readonly id: string }>(token.token).id,
          'Registro de acesso',
          'O usuário acessou o sistema',
          null,
        ),
      )
      .safeRun();
  }

  @Get('/password-recovery')
  @Roles([UserRoles.GUEST])
  @ApiOperation({ summary: 'Password recovery' })
  @ApiOkResponseMake(None, { wrapInData: false })
  @ApiErrorResponseMake(UnknownDomainError)
  passwordRecovery(
    @Query() emailInputDto: PasswordRecoveryEmailInputDto,
    @Query() cpfInputDto: PasswordRecoveryCpfInputDto,
  ): Promise<PasswordRecoveryResult> {
    return this._passwordRecovery.recoverPassword(emailInputDto.email, cpfInputDto.cpf).safeRun();
  }

  @Post('/password-change')
  @Roles([UserRoles.GUEST])
  @ApiOperation({ summary: 'Password change' })
  @ApiOkResponseMake(UserEntity)
  @ApiErrorResponseMake([UnknownDomainError, NoUserFoundDomainError, InvalidCredentialsDomainError])
  passwordChange(@Body() inputDto: PasswordChangeInputDto): Promise<PasswordChangeResult> {
    return this._passwordChange.changePassword(inputDto.resetToken, inputDto.password).safeRun();
  }
}
