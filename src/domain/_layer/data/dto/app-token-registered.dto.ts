import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AppTokenRegisteredDto {
  @ApiProperty()
  @IsBoolean()
  appTokenRegistered: boolean;
}
