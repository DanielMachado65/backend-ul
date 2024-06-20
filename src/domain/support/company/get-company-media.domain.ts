import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { CompanyMediaEntity } from 'src/domain/_entity/company.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type CompanyDomainErrors = UnknownDomainError;

export type AllCompanyMediaIO = EitherIO<CompanyDomainErrors, ReadonlyArray<CompanyMediaEntity>>;

export abstract class GetCompanyMediaDomain {
  abstract getAllMedia(): AllCompanyMediaIO;
}
