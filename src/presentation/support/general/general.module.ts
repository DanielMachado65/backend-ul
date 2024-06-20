import { Module } from '@nestjs/common';
import { GeneralDataLayerModule } from 'src/data/support/general/general-data-layer.module';
import { GeneralController } from './general.controller';
import { SupportDataLayerModule } from 'src/data/support/support/support.module';

@Module({
  imports: [GeneralDataLayerModule, SupportDataLayerModule],
  controllers: [GeneralController],
  providers: [],
})
export class GeneralPresentationLayerModule {}
