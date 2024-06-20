import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from 'class-validator';

export class CouponRulesAuthorizedQuery {
  @ApiProperty()
  @IsString()
  code: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  limit: number;
}

export class CouponRulesAuthorizedPackage {
  @ApiProperty()
  @IsString()
  packageId: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  limit: number;
}

export class CouponRulesAuthorizedSignature {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  limit: number;
}

export class CouponRulesAuthorized {
  @ApiProperty()
  queries: ReadonlyArray<CouponRulesAuthorizedQuery>;

  @ApiProperty()
  packages: ReadonlyArray<CouponRulesAuthorizedPackage>;

  @ApiProperty()
  signatures: ReadonlyArray<CouponRulesAuthorizedSignature>;
}

export class CouponRules {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  discountValueInCents: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  minValueToApplyInCents: number;

  @ApiProperty()
  @IsISO8601()
  expirationDate: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  limitUsage: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  usageMaxToUser: number;

  @ApiProperty()
  authorized: CouponRulesAuthorized;
}

export class CouponEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsString()
  creatorId: string;

  @ApiProperty()
  @IsISO8601()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  generatorId: string;

  @ApiProperty()
  rules: CouponRules;
}
