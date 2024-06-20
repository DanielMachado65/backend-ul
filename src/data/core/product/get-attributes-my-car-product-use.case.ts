import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { CarNotFoundError, NotMongoIdError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';

import {
  GetConfigIO,
  GetAttributesMyCarProductDomain,
  IGetAttributesAlertConfig,
} from 'src/domain/core/product/get-attributes-alert-config.domain';

@Injectable()
export class GetAttributesMyCarProductUseCase implements GetAttributesMyCarProductDomain {
  constructor(private readonly _myCarProductRepository: MyCarProductRepository) {}

  getAttributes(carId: string, userId: string, { only }: IGetAttributesAlertConfig): GetConfigIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => carId)
      .filter(NotMongoIdError.toFn(), (carId: string) => this._isValidMongoID(carId))
      .map(() => this._getByUserIdAndCarId(userId, carId, { only }))
      .filter(CarNotFoundError.toFn(), this._checkOwnerCar(carId, userId))
      .map(
        (myCarProductWithUser: MyCarProductWithUserDto) =>
          ({
            ...this._onlyAttributes(myCarProductWithUser, only),
          } as Partial<MyCarProductWithUserDto>),
      );
  }

  private _checkOwnerCar(carId: string, userId: string) {
    return (myCarProductWithUser: MyCarProductWithUserDto): boolean => {
      return myCarProductWithUser.carId?.toString() === carId && myCarProductWithUser.userId?.toString() === userId;
    };
  }

  private _isValidMongoID(uuid: string): boolean {
    const objectIdRegex: RegExp = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(uuid);
  }

  private _onlyAttributes<Type extends Record<string, unknown>>(
    obj: Type,
    attributesToExclude: ReadonlyArray<string>,
  ): Type {
    if (attributesToExclude.length === 0) {
      return obj;
    }

    const filteredEntries: ReadonlyArray<readonly [string, unknown]> = Object.entries(obj).filter(
      ([key]: readonly [string, unknown]) => attributesToExclude.includes(key),
    );

    return Object.fromEntries(filteredEntries) as Type;
  }

  private _getByUserIdAndCarId(
    userId: string,
    carId: string,
    { only }: IGetAttributesAlertConfig,
  ): Promise<MyCarProductWithUserDto> {
    return this._myCarProductRepository.getByUserIdAndCarId(userId, carId, {
      only: [...only, 'userId', 'carId'],
      includes: [...only],
    });
  }
}
