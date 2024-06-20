import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

import { GetProviderDataQueueDto } from 'src/domain/_layer/data/dto/get-provider-data.dto';
import { ReprocessQueryStatus } from 'src/domain/core/query/reprocess-query-queue.domain';

export class ResponseQueryQueueInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateQueryRef: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  queryRef: string;

  @ApiProperty()
  @IsNotEmpty()
  queryResponse: GetProviderDataQueueDto;

  @ApiProperty()
  status?: ReprocessQueryStatus;

  @ApiProperty()
  @IsBoolean()
  isReprocess?: boolean;
}
