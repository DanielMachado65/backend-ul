import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetBrazilStatesDomain, GetBrazilStatesResult } from 'src/domain/support/general/get-brazil-states.domain';
import {
  GetCitiesFromBrazilStateDomain,
  GetCitiesFromBrazilStateResult,
} from 'src/domain/support/general/get-cities-from-brazil-state.domain';
import {
  GetCityFromPostalCodeBrazilDomain,
  GetCityFromPostalCodeBrazilResult,
} from 'src/domain/support/general/get-city-from-postal-code-brazil.domain';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CityDto } from 'src/domain/_layer/data/dto/city.dto';
import { PostalCodeInfo } from 'src/domain/_layer/data/dto/postal-code-info.dto';
import { StateDto } from 'src/domain/_layer/data/dto/state.dto';
import { UserRoles } from 'src/domain/_layer/presentation/roles/user-roles.enum';
import { ApiList } from 'src/infrastructure/framework/swagger/schemas/list.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { GetFeatureFlagsDomain, GetFeatureFlagsResult } from '../../../domain/support/general/get-feature-flags.domain';
import {
  ContactWithMessageDomain,
  ContactWithMessageResult,
} from 'src/domain/support/support/contact-with-message.domain';
import { Captcha } from 'src/infrastructure/guard/captcha.guard';
import { CaptchaKind } from 'src/domain/_layer/infrastructure/captcha/captcha.guard';
import { ContractSupportDto } from 'src/domain/_layer/presentation/dto/contact-support.dto';
import { GetUserCountDomain, GetUserCountResult } from 'src/domain/support/general/get-user-count.domain';

@ApiTags('Geral')
@Controller('general')
export class GeneralController {
  constructor(
    private readonly _getCityFromPostalCodeBrazilDomain: GetCityFromPostalCodeBrazilDomain,
    private readonly _getCitiesFromBrazilStateDomain: GetCitiesFromBrazilStateDomain,
    private readonly _getBrazilStatesDomain: GetBrazilStatesDomain,
    private readonly _getFeatureFlagsDomain: GetFeatureFlagsDomain,
    private readonly _contactWithMessageDomain: ContactWithMessageDomain,
    private readonly _getUserCountDomain: GetUserCountDomain,
  ) {}

  @Get('/location/postal-code/:code')
  @ApiOperation({ summary: 'Get address by postal code' })
  @ApiOkResponseMake(PostalCodeInfo)
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @Roles([UserRoles.GUEST])
  getFromPostalCode(@Param('code') code: string): Promise<GetCityFromPostalCodeBrazilResult> {
    return this._getCityFromPostalCodeBrazilDomain.getFromPostalCode(code).safeRun();
  }

  @Get('/location/:state/cities')
  @ApiOperation({ summary: 'Get cities from a brazil state' })
  @ApiOkResponseMake(ApiList(CityDto))
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  getCities(@Param('state') state: string): Promise<GetCitiesFromBrazilStateResult> {
    return this._getCitiesFromBrazilStateDomain.getCities(state).safeRun();
  }

  @Get('/location/states')
  @ApiOperation({ summary: 'Get brazil states' })
  @ApiOkResponseMake(ApiList(StateDto))
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  getStates(): Promise<GetBrazilStatesResult> {
    return this._getBrazilStatesDomain.getStates().safeRun();
  }

  @Get('feature-flags')
  @ApiOperation({ summary: 'Get the current feature flags configuration' })
  @Roles([UserRoles.ADMIN])
  getFeatureFlags(): Promise<GetFeatureFlagsResult> {
    return this._getFeatureFlagsDomain.getFeatureFlags().safeRun();
  }

  @Post('/support/message')
  @ApiOperation({ summary: 'Send message to support' })
  @Roles([UserRoles.GUEST])
  @Captcha(CaptchaKind.GOOGLE_RECAPTCHA_V2)
  contact(@Body() params: ContractSupportDto): Promise<ContactWithMessageResult> {
    return this._contactWithMessageDomain.contact(params).safeRun();
  }

  @Get('/user-count')
  @Roles([UserRoles.GUEST])
  @ApiOperation({ summary: 'Count total users' })
  @ApiErrorResponseMake(UnknownDomainError)
  getUserCount(): Promise<GetUserCountResult> {
    return this._getUserCountDomain.getCount().safeRun();
  }
}
