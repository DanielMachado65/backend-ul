import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TestimonialEssentialsDto } from 'src/domain/_layer/data/dto/testimonial.dto';

export type CompanyDomainErrors = UnknownDomainError;

export type AllTestimonialResult = Either<CompanyDomainErrors, ReadonlyArray<TestimonialEssentialsDto>>;

export type AllTestimonialIO = EitherIO<CompanyDomainErrors, ReadonlyArray<TestimonialEssentialsDto>>;

export abstract class GetAllTestimonialDomain {
  abstract getAll(): AllTestimonialIO;
}
