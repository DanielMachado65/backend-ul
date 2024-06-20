import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConfigureAlertOnQueryDto } from 'src/domain/_layer/data/dto/configure-alert-on-query.dto';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  GetAlertOnQueryConfigDomain,
  GetAlertOnQueryConfigIO,
} from 'src/domain/core/product/get-alert-on-query-config.domain';

@Injectable()
export class GetAlertOnQueryConfigUseCase implements GetAlertOnQueryConfigDomain {
  constructor(private readonly _myCarProductRepository: MyCarProductRepository) {}

  private _checkOwnerCar(carId: string, userId: string) {
    return (myCarProduct: MyCarProductWithUserDto): boolean => {
      return myCarProduct?.carId?.toString() === carId && myCarProduct?.userId?.toString() === userId;
    };
  }

  private _makeResponse() {
    return ({ onQueryConfig }: MyCarProductWithUserDto): ConfigureAlertOnQueryDto => {
      return {
        isEnabled: onQueryConfig.isEnabled,
        notificationChannels: onQueryConfig.notificationChannels,
      };
    };
  }

  load(carId: string, userId: string): GetAlertOnQueryConfigIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      return await this._myCarProductRepository.getByUserIdAndCarId(userId, carId);
    })
      .filter(CarNotFoundError.toFn(), this._checkOwnerCar(carId, userId))
      .map(this._makeResponse());
  }
}
