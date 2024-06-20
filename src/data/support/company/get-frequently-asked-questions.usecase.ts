import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  AllFrequentlyAskedQuestionIO,
  GetFrequentlyAskedQuestionsDomain,
} from 'src/domain/support/company/get-frequently-asked-questions.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { FaqRepository } from 'src/domain/_layer/infrastructure/repository/faq.repository';

@Injectable()
export class GetFrequentlyAskedQuestionsUseCase implements GetFrequentlyAskedQuestionsDomain {
  constructor(private readonly _faqRepository: FaqRepository) {}

  getAll(): AllFrequentlyAskedQuestionIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._faqRepository.getAllFromCompanies());
  }
}
