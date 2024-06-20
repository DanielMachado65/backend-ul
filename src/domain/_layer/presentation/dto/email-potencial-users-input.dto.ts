import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { UserEntity } from 'src/domain/_entity/user.entity';

export class EmailPotencialUsersInputDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  to: ReadonlyArray<string>;

  @ApiProperty()
  @IsArray()
  users: ReadonlyArray<Pick<UserEntity, 'id'>>;
}
