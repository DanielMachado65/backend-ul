import { Module } from '@nestjs/common';
import { AuthDataLayerModule } from 'src/data/support/auth/auth-data-layer.module';
import { AuthController } from 'src/presentation/support/auth/auth.controller';

@Module({
  imports: [AuthDataLayerModule],
  controllers: [AuthController],
  providers: [],
})
export class AuthPresentationLayerModule {}
