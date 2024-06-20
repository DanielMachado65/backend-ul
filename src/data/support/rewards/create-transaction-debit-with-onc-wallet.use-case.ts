import { Injectable } from '@nestjs/common';
import {
  CreateTransactionDebitsWithOncWalletDomain,
  CreateTransactionDebitsWithOncWalletsIO,
} from 'src/domain/support/rewards/create-transaction-debit-with-onc-wallet.domain';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { TransactionDebitWithOncWalletBodyDto } from 'src/domain/_layer/presentation/dto/transaction-debit-with-onc-wallet-input.dto';
import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { EventEmitterService } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { AppEventDispatcher } from 'src/infrastructure/decorators/events.decorator';

@Injectable()
export class CreateTransactionDebitWithOncWalletUseCase implements CreateTransactionDebitsWithOncWalletDomain {
  constructor(
    private readonly _indicateApiService: IndicateAndEarnService,
    @AppEventDispatcher() private readonly _eventEmitterService: EventEmitterService,
  ) {}

  create(
    userId: string,
    { valueInCents }: TransactionDebitWithOncWalletBodyDto,
  ): CreateTransactionDebitsWithOncWalletsIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._createTransactionDebitWithOncWallet(userId, valueInCents),
    )
      .filter(ProviderUnavailableDomainError.toFn(), (isSubmitted: boolean) => isSubmitted)
      .tap(() =>
        this._eventEmitterService.dispatchTransactionCreditsCreated({
          userId,
          valueInCents,
        }),
      )
      .map(() => ({ valueInCents }));
  }

  private async _createTransactionDebitWithOncWallet(userId: string, valueInCents: number): Promise<boolean> {
    return await this._indicateApiService.addTransactionDebitWithOncWallet({
      userId,
      valueInCents,
    });
  }
}
