import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { AllTestimonialIO, GetAllTestimonialDomain } from 'src/domain/support/company/get-all-testimonial.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TestimonialRepository } from 'src/domain/_layer/infrastructure/repository/testimonial.repository';

@Injectable()
export class GetAllTestimonialUseCase implements GetAllTestimonialDomain {
  constructor(private readonly _testimonialRepository: TestimonialRepository) {}

  getAll(): AllTestimonialIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._testimonialRepository.getAllTestimonials());
  }
}
