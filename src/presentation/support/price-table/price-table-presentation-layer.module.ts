import { Module } from '@nestjs/common';
import { BillingDataLayerModule } from 'src/data/support/billing/billing-data-layer.module';
import { PriceTableController } from 'src/presentation/support/price-table/price-table-controller';

@Module({
  imports: [BillingDataLayerModule],
  controllers: [PriceTableController],
  providers: [],
})
export class PriceTablePresentationLayerModule {}
