import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNumber, IsString } from 'class-validator';
import { CartProductDto } from '../../data/dto/cart.dto';

export class CouponItemPackage {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class CouponProductsOutputDto {
  @ApiProperty()
  @IsString()
  couponId: string;

  @ApiProperty()
  @IsString()
  couponCode: string;

  @ApiProperty()
  @IsNumber()
  discountValueInCents: number;

  @ApiProperty()
  @IsNumber()
  totalPriceInCents: number;

  @ApiProperty()
  @IsNumber()
  totalPriceWithoutDiscountInCents: number;

  @ApiProperty({ type: [CouponItemPackage] })
  packages: ReadonlyArray<CouponItemPackage>;

  @IsArray()
  @Type(() => CartProductDto)
  @ApiProperty({ isArray: true, type: () => CartProductDto })
  queries: ReadonlyArray<CartProductDto>;
}
