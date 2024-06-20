import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  MyCarProductEntity,
  MyCarProductStatusEnum,
  MyCarProductTypeEnum,
} from 'src/domain/_entity/my-car-product.entity';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { ConfigureAlertOnQueryDto } from 'src/domain/_layer/data/dto/configure-alert-on-query.dto';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  ConfigureAlertOnQueryDomain,
  ConfigureAlertOnQueryIO,
} from 'src/domain/core/product/configure-alert-on-query.domain';

@Injectable()
export class ConfigureAlertOnQueryUseCase implements ConfigureAlertOnQueryDomain {
  constructor(private readonly _myCarProductRepository: MyCarProductRepository) {}

  private _checkOwnerCar(carId: string, userId: string) {
    return (myCarProduct: MyCarProductWithUserDto): boolean => {
      return myCarProduct.carId?.toString() === carId && myCarProduct.userId?.toString() === userId;
    };
  }

  private _checkIfPremium() {
    return (myCarProduct: MyCarProductWithUserDto): boolean => {
      return (
        myCarProduct.type === MyCarProductTypeEnum.PREMIUM &&
        (myCarProduct.status === MyCarProductStatusEnum.ACTIVE ||
          myCarProduct.status === MyCarProductStatusEnum.EXCLUDING)
      );
    };
  }

  private _updateQueryConfig(carId: string, config: ConfigureAlertOnQueryDto) {
    return async (): Promise<MyCarProductEntity> => {
      return await this._myCarProductRepository.updateById(carId, {
        onQueryConfig: {
          isEnabled: config.isEnabled,
          notificationChannels: config.notificationChannels,
        },
      });
    };
  }

  private _makeResponse() {
    return (myCarProduct: MyCarProductEntity): ConfigureAlertOnQueryDto => {
      return myCarProduct.onQueryConfig;
    };
  }

  configure(carId: string, userId: string, config: ConfigureAlertOnQueryDto): ConfigureAlertOnQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      return await this._myCarProductRepository.getByUserIdAndCarId(userId, carId);
    })
      .filter(CarNotFoundError.toFn(), this._checkOwnerCar(carId, userId))
      .filter(CarSubscriptionDeactivatedFoundError.toFn(), this._checkIfPremium())
      .map(this._updateQueryConfig(carId, config))
      .map(this._makeResponse());
  }
}
