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
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';

@Injectable()
export abstract class BaseConfigureAlertUseCase<MyCarProductType extends MyCarProductEntity, Dto> {
  constructor(protected readonly _myCarProductRepository: MyCarProductRepository) {}

  protected abstract _updateConfig(carId: string, config: Dto): Promise<MyCarProductType>;
  protected abstract _makeResponse(myCarProduct: MyCarProductType): Dto;

  protected _checkOwnerCar(carId: string, userId: string) {
    return (myCarProduct: MyCarProductWithUserDto): boolean => {
      return myCarProduct.carId?.toString() === carId && myCarProduct.userId?.toString() === userId;
    };
  }

  protected _checkIfPremium() {
    return (myCarProduct: MyCarProductWithUserDto): boolean => {
      return (
        myCarProduct.type === MyCarProductTypeEnum.PREMIUM &&
        (myCarProduct.status === MyCarProductStatusEnum.ACTIVE ||
          myCarProduct.status === MyCarProductStatusEnum.EXCLUDING)
      );
    };
  }

  configure(carId: string, userId: string, config: Dto): EitherIO<unknown, Dto> {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      return await this._myCarProductRepository.getByUserIdAndCarId(userId, carId);
    })
      .filter(CarNotFoundError.toFn(), this._checkOwnerCar(carId, userId))
      .filter(CarSubscriptionDeactivatedFoundError.toFn(), this._checkIfPremium())
      .map(() => this._updateConfig(carId, config))
      .map((value: MyCarProductType) => this._makeResponse(value));
  }
}
