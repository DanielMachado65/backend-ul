import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { CompanyMediaEntity } from 'src/domain/_entity/company.entity';

export class AllCompanyMediaOutputDto {
  @IsArray({ each: true })
  @Type(() => CompanyMediaEntity)
  @ApiProperty({ type: [CompanyMediaEntity] })
  companyMedias: ReadonlyArray<CompanyMediaEntity>;
}
