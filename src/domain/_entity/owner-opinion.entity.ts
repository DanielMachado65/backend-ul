import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';

// TODO - mnove to a VO
export class OwnerOpinionScore {
  @ApiProperty()
  @IsNumber()
  conforto: number;

  @ApiProperty()
  @IsNumber()
  cambio: number;

  @ApiProperty()
  @IsNumber()
  consumoNaCidade: number;

  @ApiProperty()
  @IsNumber()
  consumoNaEstrada: number;

  @ApiProperty()
  @IsNumber()
  performance: number;

  @ApiProperty()
  @IsNumber()
  dirigibilidade: number;

  @ApiProperty()
  @IsNumber()
  espacoInterno: number;

  @ApiProperty()
  @IsNumber()
  estabilidade: number;

  @ApiProperty()
  @IsNumber()
  freios: number;

  @ApiProperty()
  @IsNumber()
  portaMalas: number;

  @ApiProperty()
  @IsNumber()
  suspensao: number;

  @ApiProperty()
  @IsNumber()
  custoBeneficio: number;

  @ApiProperty()
  @IsNumber()
  totalScore: number;
}

export class OwnerOpinonEntity {
  @ApiProperty({ type: OwnerOpinionScore })
  @IsObject()
  @Type(() => OwnerOpinionScore)
  score: OwnerOpinionScore;
}
