import { Module, Provider } from '@nestjs/common';
import { GetAllTestimonialDomain } from 'src/domain/support/company/get-all-testimonial.domain';
import { GetAvailableInfosComparisonDomain } from 'src/domain/support/company/get-available-infos-comparison.domain';
import { GetCompanyMediaDomain } from 'src/domain/support/company/get-company-media.domain';
import { GetFrequentlyAskedQuestionsDomain } from 'src/domain/support/company/get-frequently-asked-questions.domain';
import { GetAllTestimonialUseCase } from './get-all-testimonial.usecase';
import { GetAvailableInfosComparisonUseCase } from './get-available-infos-comparison.usecase';
import { GetCompanyMediaUseCase } from './get-company-media.usecase';
import { GetFrequentlyAskedQuestionsUseCase } from './get-frequently-asked-questions.usecase';

const companyUseCases: ReadonlyArray<Provider> = [
  { provide: GetCompanyMediaDomain, useClass: GetCompanyMediaUseCase },
  { provide: GetFrequentlyAskedQuestionsDomain, useClass: GetFrequentlyAskedQuestionsUseCase },
  { provide: GetAllTestimonialDomain, useClass: GetAllTestimonialUseCase },
  { provide: GetAvailableInfosComparisonDomain, useClass: GetAvailableInfosComparisonUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...companyUseCases],
  exports: [...companyUseCases],
})
export class CompanyDataLayerModule {}
