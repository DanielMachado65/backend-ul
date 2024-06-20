import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { CarOwnerReviewDto, OwnerReviewDto } from '../../_layer/data/dto/owner-review.dto';

export type SendOwnerReviewDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type SendOwnerReviewResult = Either<SendOwnerReviewDomainErrors, OwnerReviewDto>;

export type SendOwnerReviewIO = EitherIO<SendOwnerReviewDomainErrors, OwnerReviewDto>;

export abstract class SendOwnerReviewDomain {
  readonly create: (keys: CarOwnerReviewDto) => SendOwnerReviewIO;
}
