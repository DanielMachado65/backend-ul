import { IsString } from 'class-validator';

export class UpdateCountTestDriveInputDto {
  @IsString()
  token: string;
}
