import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import { PaginationInputDto } from 'src/domain/_layer/presentation/dto/pagination-input.dto';
import { IsOptional, IsString } from 'class-validator';
import {
  ExcludeProductBoughtDomain,
  ExcludeProductBoughtResult,
} from 'src/domain/core/product/exclude-bought-product.domain';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';
import { ListMyCarsPaginatedDomain } from 'src/domain/support/admin/list-my-cars-paginated.domain';

class ListMyCarPaginatedFiltersInputDto {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsString()
  @IsOptional()
  myCarId?: string;

  @IsString()
  @IsOptional()
  plate?: string;
}

@Controller('/admin/my-cars')
export class MyCarsAdminController {
  constructor(
    private readonly _listMyCarsPaginatedUseCase: ListMyCarsPaginatedDomain,
    private readonly _excludeProductBoughtDomain: ExcludeProductBoughtDomain,
  ) {}

  @Get('/')
  @Roles([UserRoles.ADMIN])
  listMyCarsPaginated(
    @Query() { page, perPage }: PaginationInputDto,
    @Query() { email, myCarId, subscriptionId, plate }: ListMyCarPaginatedFiltersInputDto,
  ): unknown {
    return this._listMyCarsPaginatedUseCase
      .listMyCarsPaginated(page, perPage, { email, myCarId, subscriptionId, plate })
      .safeRun();
  }

  @Delete('/:carId')
  @Roles([UserRoles.ADMIN])
  excludeMC(
    @UserInfo() userInfo: UserInfo,
    @Param('carId') carId: string,
    @Query('userId') userId: string,
  ): Promise<ExcludeProductBoughtResult> {
    return this._excludeProductBoughtDomain.excludeById(carId, userId).safeRun();
  }
}
