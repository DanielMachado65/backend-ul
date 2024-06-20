import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ServiceEntity } from '../../../_entity/service.entity';

export type ServiceDto = ServiceEntity;

export class ReplacedServiceRefDto {
  @IsString()
  @IsNotEmpty()
  readonly serviceRef: string;

  @IsString()
  @IsNotEmpty()
  readonly newServiceRef: string;
}

export class ReplacedServiceCodeto {
  @IsNumber()
  readonly serviceCode: number;
  @IsNumber()
  readonly newServiceCode: number;
}
