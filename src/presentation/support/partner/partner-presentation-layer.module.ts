import { Module } from '@nestjs/common';
import { PartnerController } from './partner.controller';
import { PartnerDataLayerModule } from '../../../data/support/partner/partner-data-layer.module';

@Module({
  imports: [PartnerDataLayerModule],
  controllers: [PartnerController],
  providers: [],
})
export class PartnerPresentationLayerModule {}
