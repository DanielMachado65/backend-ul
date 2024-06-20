import { IsDate, IsNumber } from 'class-validator';

export class TotalTestDriveEntity {
  @IsNumber()
  total: number;

  @IsDate()
  createdAt: Date;
}
