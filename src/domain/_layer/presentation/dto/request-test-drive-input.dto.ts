import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { QueryKeysEntity } from 'src/domain/_entity/query-keys.entity';
import { TestDriveQueryKeys } from 'src/domain/_entity/test-drive-query.entity';

export class RequestTestDriveInputDto {
  @ValidateNested()
  @Type(() => QueryKeysEntity)
  @ApiProperty()
  keys: TestDriveQueryKeys;

  @IsString()
  @ApiProperty()
  userCity: string;
}
