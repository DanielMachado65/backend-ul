import { Module, Provider } from '@nestjs/common';
import { SendPotencialUserEmailUseCase } from './send-potencial-user-email.use-case';
import { SendPotencialUserEmailDomain } from 'src/domain/support/email/send-potencial-user-email.domain';

const useCases: ReadonlyArray<Provider> = [
  { provide: SendPotencialUserEmailDomain, useClass: SendPotencialUserEmailUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...useCases],
  exports: [...useCases],
})
export class EmailDataLayerModule {}
