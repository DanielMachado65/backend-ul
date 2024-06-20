import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsISO8601 } from 'class-validator';

export enum FaqType {
  ALL = 'all',
  QUERY = 'query',
  PACKAGE = 'package',
  SIGNATURE = 'signature',
}

export const faqTypes: ReadonlyArray<FaqType> = [FaqType.ALL, FaqType.QUERY, FaqType.PACKAGE, FaqType.SIGNATURE];

export class FaqEssentialsEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  answer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: FaqType;
}

export class FaqEntity extends FaqEssentialsEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsISO8601()
  @ApiProperty()
  deletedAt: string;

  @IsISO8601()
  @ApiProperty()
  updatedAt: string;

  @IsISO8601()
  @ApiProperty()
  createdAt: string;
}
