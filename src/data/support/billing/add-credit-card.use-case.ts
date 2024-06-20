import { Injectable } from '@nestjs/common';
import { AddCreditCardDomain, AddCreditCardIO } from 'src/domain/support/billing/add-credit-card.domain';
import { CreditCardDto } from 'src/domain/_layer/data/dto/credit-card.dto';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { ArcUtil } from 'src/infrastructure/util/arc.util';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';

@Injectable()
export class AddCreditCardUseCase implements AddCreditCardDomain {
  private _originalCnpj: string;

  constructor(
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _userRepository: UserRepository,
    private readonly _arcUtil: ArcUtil,
    private readonly _envService: EnvService,
  ) {
    this._originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  addCreditCard(userId: string, creditCard: CreditCardDto): AddCreditCardIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .filter(UnknownDomainError.toFn(), (user: UserDto) =>
        this._arcUtil.verifyIfUserHasIdForTenant(user, this._originalCnpj),
      )
      .flatMap((user: UserDto) => this._saveCardExternally(user, creditCard)); // TODO
  }

  private _saveCardExternally(user: UserDto, creditCard: CreditCardDto): AddCreditCardIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._paymentGatewayService.saveCreditCard(
        this._arcUtil.getUserArcRef(user, this._originalCnpj),
        creditCard,
        this._originalCnpj,
      ),
    );
  }
}
