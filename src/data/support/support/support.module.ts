import { Module, Provider } from '@nestjs/common';
import { ContactWithMessageDomain } from 'src/domain/support/support/contact-with-message.domain';
import { ContactWithMessageUseCase } from './contact-with-message.use-case';

const providers: ReadonlyArray<Provider> = [{ provide: ContactWithMessageDomain, useClass: ContactWithMessageUseCase }];

@Module({
  imports: [],
  controllers: [],
  providers: [...providers],
  exports: [...providers],
})
export class SupportDataLayerModule {}
