import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum PostalCodeInfoOrigin {
  VIACEP = 'VIACEP',
  BRASIL_API = 'BRASIL_API',
}

export class PostalCodeInfo {
  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  street?: string;

  @ApiProperty()
  neighborhood?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  uf: string;

  @ApiProperty()
  complement?: string;

  @ApiProperty()
  ddd: string;

  @IsEnum(PostalCodeInfoOrigin)
  @ApiProperty()
  __origin__: PostalCodeInfoOrigin;
}
