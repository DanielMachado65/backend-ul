import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  ListAllBoughtProductDomain,
  ListAllBoughtProductIO,
} from 'src/domain/core/product/list-all-bought-product.domain';

@Injectable()
export class ListAllBoughtProductUseCase implements ListAllBoughtProductDomain {
  constructor(private readonly _myCarProductRepository: MyCarProductRepository) {}

  listAll(userId: string, page: number, perPage: number): ListAllBoughtProductIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._myCarProductRepository.listByUserId(userId, page, perPage, [
        MyCarProductStatusEnum.ACTIVE,
        MyCarProductStatusEnum.DEACTIVE,
        MyCarProductStatusEnum.EXCLUDING,
      ]),
    );
  }
}
