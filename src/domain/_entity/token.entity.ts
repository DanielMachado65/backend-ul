import { ApiProperty } from '@nestjs/swagger';

export class TokenEntity {
  @ApiProperty()
  token: string;
}
