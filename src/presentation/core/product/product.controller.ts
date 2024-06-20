import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetCreditPacksDomain, GetCreditPacksResult } from 'src/domain/core/product/get-credit-packs.domain';
import { PackageEntity } from 'src/domain/_entity/package.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ApiList } from 'src/infrastructure/framework/swagger/schemas/list.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';

@ApiTags('Produto')
@Controller('product')
export class ProductController {
  constructor(private readonly _getCreditPacksDoamin: GetCreditPacksDomain) {}

  @Get('/credit-packs')
  @ApiOperation({ summary: 'returns credit packs available to buy' })
  @ApiOkResponseMake(ApiList(PackageEntity))
  @ApiErrorResponseMake(UnknownDomainError)
  @Roles([UserRoles.GUEST])
  getCreditPacks(): Promise<GetCreditPacksResult> {
    return this._getCreditPacksDoamin.getCreditPacks().safeRun();
  }
}
