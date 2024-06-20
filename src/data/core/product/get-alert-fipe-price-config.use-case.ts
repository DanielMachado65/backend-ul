import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConfigureAlertFipePriceDto } from 'src/domain/_layer/data/dto/configure-alert-fipe-price.dto';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  GetAlertFipePriceConfigDomain,
  GetAlertFipePriceConfigIO,
} from 'src/domain/core/product/get-alert-fipe-price-config.domain.';

@Injectable()
export class GetAlertFipePriceConfigUseCase implements GetAlertFipePriceConfigDomain {
  constructor(private readonly _myCarProductRepository: MyCarProductRepository) {}

  private _checkOwnerCar(carId: string, userId: string) {
    return (myCarProduct: MyCarProductWithUserDto): boolean => {
      return myCarProduct?.carId?.toString() === carId && myCarProduct?.userId?.toString() === userId;
    };
  }

  private _makeResponse() {
    return ({ priceFIPEConfig }: MyCarProductWithUserDto): ConfigureAlertFipePriceDto => {
      return {
        isEnabled: priceFIPEConfig.isEnabled,
        notificationChannels: priceFIPEConfig.notificationChannels,
      };
    };
  }

  load(carId: string, userId: string): GetAlertFipePriceConfigIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      return await this._myCarProductRepository.getByUserIdAndCarId(userId, carId);
    })
      .filter(CarNotFoundError.toFn(), this._checkOwnerCar(carId, userId))
      .map(this._makeResponse());
  }
}
