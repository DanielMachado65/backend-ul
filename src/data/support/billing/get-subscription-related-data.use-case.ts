import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NotFoundMyCarDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  GetSubscriptionRelatedDataDomain,
  GetSubscriptionRelatedDataIO,
  GetSubscriptionsRelatedDataIO,
} from 'src/domain/support/billing/get-subscription-related-data.domain';

@Injectable()
export class GetSubscriptionRelatedDataUseCase implements GetSubscriptionRelatedDataDomain {
  constructor(private readonly _myCarProductRepository: MyCarProductRepository) {}

  fromSingle(_userId: string, subscriptionId: string): GetSubscriptionRelatedDataIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._myCarProductRepository.getBySubscriptionId(subscriptionId),
    )
      .filter(NotFoundMyCarDomainError.toFn(), Boolean)
      .map((myCarProduct: MyCarProductDto) => ({
        plate: myCarProduct.keys.plate,
      }))
      .catch((error: UnknownDomainError) =>
        error instanceof NotFoundMyCarDomainError ? Either.right(null) : Either.left(error),
      );
  }

  fromMultiple(userId: string, subscriptionIds: readonly string[]): GetSubscriptionsRelatedDataIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () =>
      Promise.all(subscriptionIds.map((subscriptionId: string) => this.fromSingle(userId, subscriptionId).unsafeRun())),
    );
  }
}
