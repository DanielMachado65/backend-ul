import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { ReplacedServiceCodeto } from 'src/domain/_layer/data/dto/service.dto';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { ClientType } from '../../../_entity/client.entity';
import { QueryKeysEntity } from '../../../_entity/query-keys.entity';

export class RequestQueryInputDto {
  @IsNumber()
  @IsInt()
  @IsPositive()
  @ApiProperty()
  queryCode: number;

  @ValidateNested()
  @Type(() => QueryKeysEntity)
  @ApiProperty()
  keys: QueryKeysEntity;

  @IsEnum(ClientType)
  @EnumUtil.ApiProperty(ClientType)
  clientType: ClientType = ClientType.WEBSITE;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  mayDuplicate: boolean = false;
}

export class ReplaceFailedServicesInputDto {
  services: ReadonlyArray<ReplacedServiceCodeto>;
}
