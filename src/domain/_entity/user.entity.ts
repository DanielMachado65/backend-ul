import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LowerCase } from 'src/infrastructure/decorators/lowercase.decorator';
import { ValidateUserPhoneNumberDomain } from 'src/infrastructure/decorators/validation-dto.decorator';
import { EnumUtil } from 'src/infrastructure/util/enum.util';

export enum UserType {
  PRE_PAID = 1,
  INTEGRATION = 2,
  PARTNER = 3,
  RESALE = 4,
  POS_PAID = 5,
  OPERATOR = 6,
  OPERATOR_ADMIN = 7,
  MASTER = 10,
}

export const userTypes: ReadonlyArray<UserType> = [
  UserType.PRE_PAID,
  UserType.INTEGRATION,
  UserType.PARTNER,
  UserType.RESALE,
  UserType.POS_PAID,
  UserType.OPERATOR,
  UserType.OPERATOR_ADMIN,
  UserType.MASTER,
];

export enum UserCreationOrigin {
  ADMIN = 'admin',
  WEBSITE = 'website',
  ANDROID = 'android-app',
  IOS = 'ios-app',
  UNKNOWN = 'unknown',
}

export const userCreationOrigins: ReadonlyArray<UserCreationOrigin> = [
  UserCreationOrigin.WEBSITE,
  UserCreationOrigin.ANDROID,
  UserCreationOrigin.IOS,
  UserCreationOrigin.UNKNOWN,
];

export abstract class UserAddress {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  zipCode?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  city?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  state?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  neighborhood?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  street?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  complement?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  number?: string;
}

export abstract class UserCompany {
  @ApiProperty()
  @IsString()
  @IsOptional()
  cnpj: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  socialName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fantasyName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  cnae: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  stateSubscription: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isNationalSimple: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  legalCode: string;
}

export abstract class UserHierarchy {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  ownerId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  partnerId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  indicatorId?: string;
}

export abstract class UserExternalControl {
  @IsString()
  id: string;
}

export abstract class UserExternalArcTenantControl {
  @IsString()
  id: string;

  @IsString()
  cnpj: string;
}

export abstract class UserExternalArcControl {
  /**
   * @deprecated - Should use tenants field instead
   */
  @IsString()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserExternalArcTenantControl)
  tenants: ReadonlyArray<UserExternalArcTenantControl>;
}

export abstract class UserExternalControls {
  @ApiProperty()
  @IsObject()
  @Type(() => UserExternalControl)
  asaas: UserExternalControl;

  @ApiProperty()
  @IsObject()
  @Type(() => UserExternalControl)
  iugu: UserExternalControl;

  @ApiProperty()
  @IsObject()
  @Type(() => UserExternalArcControl)
  arc: UserExternalArcControl;
}

export class UserEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @LowerCase()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty()
  @ValidateUserPhoneNumberDomain()
  phoneNumber: string;

  @ApiProperty()
  @IsObject()
  @Type(() => UserAddress)
  address: UserAddress;

  @EnumUtil.ApiProperty(UserType)
  @IsEnum(UserType)
  type: UserType;

  @ApiProperty()
  @IsISO8601()
  lastLogin: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @EnumUtil.ApiProperty(UserCreationOrigin)
  @IsEnum(UserCreationOrigin)
  creationOrigin: UserCreationOrigin;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  billingId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  partnerId?: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UserCompany)
  company: UserCompany;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UserHierarchy)
  hierarchy: UserHierarchy;

  @ApiProperty()
  @IsObject()
  @Type(() => UserExternalControls)
  externalControls: UserExternalControls;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  whenDeletedAt: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  deletedAt: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isEligibleForMigration?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  needsPasswordUpdate?: boolean;

  @ApiProperty()
  @IsArray()
  webhookUrls: string[];
}
