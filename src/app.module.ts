import { Module } from '@nestjs/common';
import { PresentationLayerModule } from './presentation/presentation-layer.module';
import { InfrastructureLayerModule } from './infrastructure/infrastructure-layer.module';

@Module({
  imports: [InfrastructureLayerModule, PresentationLayerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
