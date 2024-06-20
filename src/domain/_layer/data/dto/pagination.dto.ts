import { ApiProperty } from '@nestjs/swagger';

export class PaginationOf<Dto> {
  @ApiProperty()
  readonly totalPages: number;

  @ApiProperty()
  readonly amountInThisPage: number;

  @ApiProperty()
  readonly currentPage: number;

  @ApiProperty()
  readonly itemsPerPage: number;

  @ApiProperty({ nullable: true })
  readonly nextPage: number | null;

  @ApiProperty({ nullable: true })
  readonly previousPage: number | null;

  @ApiProperty()
  readonly items: ReadonlyArray<Dto>;

  @ApiProperty()
  readonly count: number;
}
