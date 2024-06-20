import { Either } from '@alissonfpmorais/minimal_fp';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllTestimonialResult, GetAllTestimonialDomain } from 'src/domain/support/company/get-all-testimonial.domain';
import {
  AvailableInfosComparisonResult,
  GetAvailableInfosComparisonDomain,
} from 'src/domain/support/company/get-available-infos-comparison.domain';
import { CompanyDomainErrors, GetCompanyMediaDomain } from 'src/domain/support/company/get-company-media.domain';
import { GetFrequentlyAskedQuestionsDomain } from 'src/domain/support/company/get-frequently-asked-questions.domain';
import { CompanyMediaEntity } from 'src/domain/_entity/company.entity';
import { QueryInfoEssentialsEntity } from 'src/domain/_entity/query-info.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TestimonialEssentialsEntity } from 'src/domain/_entity/testimonial.entity';
import { FaqEssentialsDto } from 'src/domain/_layer/data/dto/faq.dto';
import { AllCompanyMediaOutputDto } from 'src/domain/_layer/presentation/dto/all-company-media-output.dto';
import { AllFaqOutputDto } from 'src/domain/_layer/presentation/dto/all-faq-output.dto';
import { UserRoles } from 'src/domain/_layer/presentation/roles/user-roles.enum';
import { ApiList } from 'src/infrastructure/framework/swagger/schemas/list.schema';
import { ApiErrorResponseMake, ApiOkResponseMake } from 'src/infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from 'src/infrastructure/guard/roles.guard';

@ApiTags('Company')
@Controller('/company')
export class CompanyController {
  constructor(
    private readonly _getCompanyMediaDomain: GetCompanyMediaDomain,
    private readonly _getFrequentlyAskedQuestionsDomain: GetFrequentlyAskedQuestionsDomain,
    private readonly _getAllTestimonialDomain: GetAllTestimonialDomain,
    private readonly _getAvailableInfosComparisonDomain: GetAvailableInfosComparisonDomain,
  ) {}

  @Get('/media')
  @Roles([UserRoles.GUEST])
  @ApiOkResponseMake(AllCompanyMediaOutputDto)
  @ApiErrorResponseMake(UnknownDomainError)
  @ApiOperation({ summary: 'Get all medias from all companies' })
  getAllCompanyMedia(): Promise<Either<CompanyDomainErrors, AllCompanyMediaOutputDto>> {
    return this._getCompanyMediaDomain
      .getAllMedia()
      .map((medias: ReadonlyArray<CompanyMediaEntity>): AllCompanyMediaOutputDto => ({ companyMedias: medias }))
      .safeRun();
  }

  @Get('/all-faq')
  @Roles([UserRoles.GUEST])
  @ApiOkResponseMake(AllFaqOutputDto)
  @ApiErrorResponseMake(UnknownDomainError)
  @ApiOperation({ summary: 'Get all faqs from all companies' })
  getAllFaq(): Promise<Either<CompanyDomainErrors, AllFaqOutputDto>> {
    return this._getFrequentlyAskedQuestionsDomain
      .getAll()
      .map((faqs: ReadonlyArray<FaqEssentialsDto>): AllFaqOutputDto => ({ frequentlyAskedQuestions: faqs }))
      .safeRun();
  }

  @Get('/all-testimonials')
  @Roles([UserRoles.GUEST])
  @ApiOkResponseMake(ApiList(TestimonialEssentialsEntity))
  @ApiErrorResponseMake(UnknownDomainError)
  @ApiOperation({ summary: 'Get all testimonials' })
  getAllTestimonials(): Promise<AllTestimonialResult> {
    return this._getAllTestimonialDomain.getAll().safeRun();
  }

  @Get('/all-available-info-comparison')
  @Roles([UserRoles.GUEST])
  @ApiOkResponseMake(ApiList(QueryInfoEssentialsEntity))
  @ApiErrorResponseMake(UnknownDomainError)
  @ApiOperation({ summary: 'Get available info comparison' })
  getAvailableInfosComparison(): Promise<AvailableInfosComparisonResult> {
    return this._getAvailableInfosComparisonDomain.getComparisons().safeRun();
  }
}
