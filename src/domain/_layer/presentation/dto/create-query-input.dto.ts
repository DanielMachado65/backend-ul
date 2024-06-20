import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryKeysEntity } from '../../../_entity/query-keys.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQueryInputDto {
  @IsNumber()
  @IsInt()
  @IsPositive()
  @ApiProperty()
  queryCode: number;

  @ValidateNested()
  @Type(() => QueryKeysEntity)
  @ApiProperty()
  queryKeys: QueryKeysEntity;

  @IsBoolean()
  @IsOptional()
  mayDuplicate: boolean = true;
}
