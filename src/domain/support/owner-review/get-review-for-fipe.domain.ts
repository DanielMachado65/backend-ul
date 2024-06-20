import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { RankingDto } from 'src/domain/_layer/data/dto/owner-review.dto';

export type GetReviewForFipeDomainErrors = ProviderUnavailableDomainError;

export type GetReviewForFipeResult = Either<GetReviewForFipeDomainErrors, RankingDto>;

export type GetReviewForFipeIO = EitherIO<GetReviewForFipeDomainErrors, RankingDto>;

export abstract class GetReviewForFipeDomain {
  abstract getReviewForFipe(fipeId: string): GetReviewForFipeIO;
}
