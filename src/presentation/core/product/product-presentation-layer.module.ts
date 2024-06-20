import { Module } from '@nestjs/common';
import { ProductDataLayerModule } from 'src/data/core/product/product-data-layer.module';
import { BillingDataLayerModule } from 'src/data/support/billing/billing-data-layer.module';
import { MyCarsController } from './my-cars.controller';
import { ProductController } from './product.controller';
import { MyCarsAdminController } from './my-cars-admin.controller';
import { AdminDataModule } from 'src/data/support/admin/admin.module';

@Module({
  imports: [ProductDataLayerModule, BillingDataLayerModule, AdminDataModule],
  controllers: [ProductController, MyCarsController, MyCarsAdminController],
  providers: [],
})
export class ProductPresentationLayerModule {}
