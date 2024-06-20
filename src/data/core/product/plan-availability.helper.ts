import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { EnvService } from 'src/infrastructure/framework/env.service';

@Injectable()
export class PlanAvailabilityHelper {
  _specialUsersWithoutLimits?: ReadonlyArray<string> = [
    'user_test@mobile.com',
    'alisson.morais@olhonocarro.com.br',
    'yago@olhonocarro.com.br',
  ];

  constructor(
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _envService: EnvService,
  ) {}

  getUserFreemiumAvailability(user: UserDto): EitherIO<UnknownDomainError, boolean> {
    if (!user) return EitherIO.of(UnknownDomainError.toFn(), true);

    const isSpecialUserInRightEnv: boolean =
      !this._envService.isProdEnv() && this._specialUsersWithoutLimits.some((email: string) => user.email === email);

    if (isSpecialUserInRightEnv) return EitherIO.of(UnknownDomainError.toFn(), true);

    return EitherIO.of(UnknownDomainError.toFn(), user.id).map((userId: string) =>
      this._checkMyCarProductDoesNotExist(userId),
    );
  }

  private async _checkMyCarProductDoesNotExist(userId: string): Promise<boolean> {
    const totalCars: number = await this._myCarProductRepository.countByUserId(userId);
    return totalCars <= 0;
  }
}
