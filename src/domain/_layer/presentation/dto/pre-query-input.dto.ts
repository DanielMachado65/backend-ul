import { IsOptional, IsString } from 'class-validator';

export class PreQueryInputDto {
  @IsString()
  @IsOptional()
  plate?: string;

  @IsString()
  @IsOptional()
  chassis?: string;

  @IsString()
  @IsOptional()
  engineNumber?: string;
}
