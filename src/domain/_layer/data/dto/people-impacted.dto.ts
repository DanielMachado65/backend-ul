import { ApiProperty } from '@nestjs/swagger';

export class PeopleImpactedDto {
  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  peopleCount: number;
}
