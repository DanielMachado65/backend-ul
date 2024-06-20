import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnallowedToRemoveCreditCardError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { CreditCardMinimalDto } from 'src/domain/_layer/data/dto/credit-card-minimal.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  PaymentGatewayService,
  ThingsLockingCreditCard,
} from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { RemoveCreditCardDomain, RemoveCreditCardIO } from 'src/domain/support/billing/remove-credit-card.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';
import { ArcUtil } from 'src/infrastructure/util/arc.util';

@Injectable()
export class RemoveCreditCardUseCase implements RemoveCreditCardDomain {
  private _originalCnpj: string;

  constructor(
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _userRepository: UserRepository,
    private readonly _arcUtil: ArcUtil,
    private readonly _envService: EnvService,
  ) {
    this._originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  remove(userId: string, creditCardId: string): RemoveCreditCardIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .filter(UnknownDomainError.toFn(), (user: UserDto) =>
        this._arcUtil.verifyIfUserHasIdForTenant(user, this._originalCnpj),
      )
      .flatMap((user: UserDto) => this._removeCardExternally(user, creditCardId)); // TODO
  }

  private _removeCardExternally(user: UserDto, creditCardId: string): RemoveCreditCardIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._paymentGatewayService.removeCreditCard(
        this._arcUtil.getUserArcRef(user, this._originalCnpj),
        creditCardId,
        this._originalCnpj,
      ),
    ).flatMap((result: Either<ThingsLockingCreditCard, CreditCardMinimalDto>) => {
      if (result.isRight()) {
        return EitherIO.of(UnknownDomainError.toFn(), result.getRight());
      } else {
        const error: unknown = result.getLeft();
        if (error instanceof ThingsLockingCreditCard) {
          const count: number = error.errors.reduce(
            // eslint-disable-next-line @typescript-eslint/typedef
            (total: number, next) => total + (next.details.type === 'subscription' ? 1 : 0),
            0,
          );
          return EitherIO.raise(() =>
            count === 1
              ? new UnallowedToRemoveCreditCardError(
                  `Não é possivel remover o cartão. Há 1 assinatura dependente desse cartão`,
                )
              : new UnallowedToRemoveCreditCardError(
                  `Não é possivel remover o cartão. Há ${count} assinaturas dependentes desse cartão`,
                ),
          ) as RemoveCreditCardIO;
        } else {
          return EitherIO.raise(() => error) as RemoveCreditCardIO;
        }
      }
    });
  }
}
