import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';
import { ClientType } from '../../../_entity/client.entity';

export class GetAlreadyParamInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  queryId: string;
}

export class GetAlreadyQueryInputDto {
  @IsEnum(ClientType)
  @EnumUtil.ApiProperty(ClientType)
  clientType: ClientType = ClientType.WEBSITE;
}
