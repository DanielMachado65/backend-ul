import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CompanyScoreVo } from 'src/domain/value-object/credit/credit-score.vo';
import { PersonScoreVo } from 'src/domain/value-object/credit/person-score.vo';
import { IsCPF } from 'src/infrastructure/decorators';
import { IndicatorScoreVo } from '../value-object/credit/indicator-score.vo';

export class CreditQueryKeysEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsCPF()
  cpf?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cnpj?: string;
}

export class CreditScoreEntity {
  personScore?: PersonScoreVo;
  companyScore?: CompanyScoreVo;
  indicatorsScore?: IndicatorScoreVo;
}
