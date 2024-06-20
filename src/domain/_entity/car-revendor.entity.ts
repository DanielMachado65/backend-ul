import { IsBoolean, IsISO8601, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export abstract class CarRevendorEntity {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @ApiProperty()
  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}
