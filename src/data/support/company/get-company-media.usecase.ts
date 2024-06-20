import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { AllCompanyMediaIO, GetCompanyMediaDomain } from 'src/domain/support/company/get-company-media.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { CompanyRepository } from 'src/domain/_layer/infrastructure/repository/company.repository';

@Injectable()
export class GetCompanyMediaUseCase implements GetCompanyMediaDomain {
  constructor(private readonly _companyRepository: CompanyRepository) {}

  getAllMedia(): AllCompanyMediaIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._companyRepository.getAllMedia());
  }
}
