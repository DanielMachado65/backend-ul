import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class PackageEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsISO8601()
  createAt: string;

  @ApiProperty()
  @IsNumber()
  purchasePriceInCents: number;

  @ApiProperty()
  @IsNumber()
  attributedValueInCents: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;
}
