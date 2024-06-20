import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { PeopleImpactedDomain, PeopleImpactedResult } from '../../../domain/support/marketing/people-impacted.domain';
import { PeopleImpactedDto } from '../../../domain/_layer/data/dto/people-impacted.dto';
import {
  ApiErrorResponseMake,
  ApiOkResponseMake,
} from '../../../infrastructure/framework/swagger/setup/swagger-builders';

@ApiTags('Marketing')
@Controller('marketing')
export class MarketingController {
  constructor(private readonly _peopleImpactedDomain: PeopleImpactedDomain) {}

  @Get('people-impacted')
  @ApiOperation({ summary: 'Get people impacted info' })
  @ApiOkResponseMake(PeopleImpactedDto)
  @ApiErrorResponseMake(UnknownDomainError)
  @Roles([UserRoles.GUEST])
  getPeopleImpacted(): Promise<PeopleImpactedResult> {
    return this._peopleImpactedDomain.getPeopleImpacted().safeRun();
  }
}
