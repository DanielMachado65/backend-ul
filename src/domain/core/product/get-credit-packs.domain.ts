import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { PackageDto } from 'src/domain/_layer/data/dto/package.dto';
import { UnknownDomainError } from '../../_entity/result.error';

export type GetCreditPacksDomainErrors = UnknownDomainError;

export type GetCreditPacksResult = Either<GetCreditPacksDomainErrors, ReadonlyArray<PackageDto>>;

export type GetCreditPacksIO = EitherIO<GetCreditPacksDomainErrors, ReadonlyArray<PackageDto>>;

export abstract class GetCreditPacksDomain {
  readonly getCreditPacks: () => GetCreditPacksIO;
}
