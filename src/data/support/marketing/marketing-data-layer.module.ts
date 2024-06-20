import { Module, Provider } from '@nestjs/common';
import { SendQueryToMarketingDomain } from 'src/domain/support/marketing/send-query-to-marketing.domain';
import { PeopleImpactedDomain } from '../../../domain/support/marketing/people-impacted.domain';
import { PeopleImpactedUseCase } from './people-impacted.use-case';
import { SendQueryToMarketingUseCase } from './send-query-to-marketing.use-case';
import { SendPaymentToEmailMarketingDomain } from '../../../domain/support/marketing/send-payment-to-email-marketing.domain';
import { SendPaymentToEmailMarketingUseCase } from './send-payment-to-email-marketing.use-case';
import { SendPaymentToTagManagerDomain } from '../../../domain/support/marketing/send-payment-to-tag-manager.domain';
import { SendPaymentToTagManagerUseCase } from './send-payment-to-tag-manager.use-case';

const useCases: ReadonlyArray<Provider> = [
  { provide: PeopleImpactedDomain, useClass: PeopleImpactedUseCase },
  { provide: SendPaymentToEmailMarketingDomain, useClass: SendPaymentToEmailMarketingUseCase },
  { provide: SendPaymentToTagManagerDomain, useClass: SendPaymentToTagManagerUseCase },
  { provide: SendQueryToMarketingDomain, useClass: SendQueryToMarketingUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...useCases],
  exports: [...useCases],
})
export class MarketingDataLayerModule {}
