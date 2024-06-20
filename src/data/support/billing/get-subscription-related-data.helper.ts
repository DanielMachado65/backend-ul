import { EitherIO, Either } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError, NotFoundMyCarDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { SubscriptionRelatedDataDto } from 'src/domain/_layer/data/dto/subscription-related-data.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';

@Injectable()
export class GetSubscriptionRelatedDataHelper {
  constructor(private readonly _myCarProductRepository: MyCarProductRepository) {}

  fromSingle(
    _userId: string,
    subscriptionId: string,
  ): EitherIO<UnknownDomainError | NotFoundMyCarDomainError, SubscriptionRelatedDataDto> {
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
}
