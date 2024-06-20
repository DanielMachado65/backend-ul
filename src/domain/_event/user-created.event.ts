import { UserDto } from 'src/domain/_layer/data/dto/user.dto';

export type UserCreatedEvent = {
  readonly userId: string;
  readonly reqParentId: string;
  readonly user: UserDto;
};
