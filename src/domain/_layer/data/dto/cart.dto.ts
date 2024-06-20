import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CartProductDto {
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsInt()
  @IsPositive()
  @ApiProperty()
  amount: number;
}

export class CartProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartProductDto)
  @ApiProperty({ isArray: true, type: () => CartProductDto })
  packages: ReadonlyArray<CartProductDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartProductDto)
  @ApiProperty({ isArray: true, type: () => CartProductDto })
  queries: ReadonlyArray<CartProductDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartProductDto)
  @ApiProperty({ isArray: true, type: () => CartProductDto })
  subscriptions: ReadonlyArray<CartProductDto>;
}

export class CartDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  coupon?: string;

  @ValidateNested()
  @IsObject()
  @Type(() => CartProductsDto)
  @ApiProperty({ type: () => CartProductsDto })
  products: CartProductsDto;
}
