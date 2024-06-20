import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsMongoId, IsNumber, ValidateNested } from 'class-validator';
import { CartProductDto } from '../../data/dto/cart.dto';

export class CouponItemPackage {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class CouponProductsInputDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponItemPackage)
  @ApiProperty({ isArray: true, type: () => CouponItemPackage })
  packages: ReadonlyArray<CouponItemPackage>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartProductDto)
  @ApiProperty({ isArray: true, type: () => CartProductDto })
  queries: ReadonlyArray<CartProductDto>;
}
