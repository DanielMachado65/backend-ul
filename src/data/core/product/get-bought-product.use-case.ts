import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NotFoundMyCarDomainError, NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { GetBoughtProductDomain, GetBoughtProductIO } from 'src/domain/core/product/get-bought-product.domain';

@Injectable()
export class GetBoughtProductUseCase implements GetBoughtProductDomain {
  constructor(
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _userRepository: UserRepository,
  ) {}

  getById(id: string, userId: string): GetBoughtProductIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._getUserById(userId))
      .filter(NoUserFoundDomainError.toFn(), (user: UserDto) => Boolean(user))
      .map((user: UserDto) => this._getMyCarById(id, user.billingId))
      .filter(NotFoundMyCarDomainError.toFn(), (myCar: MyCarProductDto) => Boolean(myCar));
  }

  async _getUserById(id: string): Promise<UserDto> {
    return await this._userRepository.getById(id);
  }

  async _getMyCarById(id: string, billingId: string): Promise<MyCarProductDto> {
    return await this._myCarProductRepository.getByIdAndBillingId(id, billingId);
  }
}
