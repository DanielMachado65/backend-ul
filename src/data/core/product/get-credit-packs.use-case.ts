import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GetCreditPacksDomain, GetCreditPacksIO } from 'src/domain/core/product/get-credit-packs.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';

@Injectable()
export class GetCreditPacksUseCase implements GetCreditPacksDomain {
  constructor(private readonly _packageRepository: PackageRepository) {}

  getCreditPacks(): GetCreditPacksIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._packageRepository.getAll());
  }
}
