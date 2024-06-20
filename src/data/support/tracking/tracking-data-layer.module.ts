import { Module, Provider } from '@nestjs/common';
import { TrackCheckoutInitDomain } from 'src/domain/support/payment/track-checkout-init.domain';
import { TrackCheckoutInitUseCase } from './track-checkout-init.use-case';
import { TrackPartnerInteractionDomain } from 'src/domain/support/tracking/track-partner-interaction.domain';
import { TrackPartnerInteractionUseCase } from './track-partner-interaction.use-case';

const externalProviders: ReadonlyArray<Provider> = [
  { provide: TrackCheckoutInitDomain, useClass: TrackCheckoutInitUseCase },
  { provide: TrackPartnerInteractionDomain, useClass: TrackPartnerInteractionUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...externalProviders],
  exports: [...externalProviders],
})
export class TrackingDataLayerModule {}
