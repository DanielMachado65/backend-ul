import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsISO8601, IsString } from 'class-validator';

export class CompanyMediaEntity {
  @IsString()
  @ApiProperty()
  logo: string;

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  url: string;
}

export class CompanyEntity {
  @IsString()
  @ApiProperty()
  id: string;

  @IsArray({ each: true })
  @Type(() => CompanyMediaEntity)
  @ApiProperty({ type: [CompanyMediaEntity] })
  medias: ReadonlyArray<CompanyMediaEntity>;

  @IsArray({ each: true })
  @Type(() => String)
  @ApiProperty()
  faq: ReadonlyArray<string>;

  @IsISO8601()
  @ApiProperty()
  createdAt: string;

  @IsISO8601()
  @ApiProperty()
  updatedAt: string;
}
