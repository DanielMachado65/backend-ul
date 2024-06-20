import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPaymentStatusInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  paymentId: string;
}
