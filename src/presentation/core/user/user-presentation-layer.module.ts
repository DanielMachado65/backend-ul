import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserDataLayerModule } from '../../../data/core/user/user-data-layer.module';
import { AuthDataLayerModule } from 'src/data/support/auth/auth-data-layer.module';

@Module({
  imports: [UserDataLayerModule, AuthDataLayerModule],
  controllers: [UserController],
  providers: [],
})
export class UserPresentationLayerModule {}
