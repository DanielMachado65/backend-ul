import { AddIndicatedPaymentDomain } from '../../../domain/support/partner/add-indicator-incoming.domain';
import { AddIndicatedPaymentUseCase } from './add-indicated-payment.use-case';
import { AddPartnerIncomingDomain } from '../../../domain/support/partner/add-partner-incoming.domain';
import { AddPartnerIncomingUseCase } from './add-partner-incoming.use-case';
import { GetPartnerIncomingsUseCase } from './get-partner-incomings.use-case';
import { Module, Provider } from '@nestjs/common';
import { PartnerIncomingDomain } from '../../../domain/support/partner/get-partner-incomings.domain';

const addIndicatedPaymentProvider: Provider = {
  provide: AddIndicatedPaymentDomain,
  useClass: AddIndicatedPaymentUseCase,
};

const addPartnerIncomingProvider: Provider = {
  provide: AddPartnerIncomingDomain,
  useClass: AddPartnerIncomingUseCase,
};

const getPartnerIncomingProvider: Provider = {
  provide: PartnerIncomingDomain,
  useClass: GetPartnerIncomingsUseCase,
};

@Module({
  imports: [],
  controllers: [],
  providers: [addIndicatedPaymentProvider, addPartnerIncomingProvider, getPartnerIncomingProvider],
  exports: [addIndicatedPaymentProvider, addPartnerIncomingProvider, getPartnerIncomingProvider],
})
export class PartnerDataLayerModule {}
