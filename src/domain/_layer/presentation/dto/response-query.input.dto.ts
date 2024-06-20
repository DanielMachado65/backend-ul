import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { QueryResponseEntity } from 'src/domain/_entity/query-response.entity';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { ReprocessQueryStatus } from 'src/domain/core/query/reprocess-query-queue.domain';

export class ResponseQueryInputDto {
  @ApiProperty()
  @Type(() => QueryResponseEntity)
  queryResponse: QueryResponseDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateQueryRef: string;
}

export class ResponseReprocessQueryInputDto {
  @ApiProperty()
  @Type(() => QueryResponseEntity)
  queryResponse: QueryResponseDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateQueryRef: string;

  @ApiProperty()
  status?: ReprocessQueryStatus;

  @ApiProperty()
  @IsBoolean()
  isReprocess?: boolean;
}
