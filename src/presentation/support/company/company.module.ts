import { Module } from '@nestjs/common';
import { CompanyDataLayerModule } from 'src/data/support/company/company-data-layer.module';
import { CompanyController } from './company.controller';

@Module({
  imports: [CompanyDataLayerModule],
  controllers: [CompanyController],
  providers: [],
  exports: [],
})
export class CompanyPresentationLayerModule {}
