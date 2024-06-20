import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { DataNotFoundDomainError } from 'src/domain/_entity/result.error';
import { OwnerReviewQueryResult } from 'src/domain/_layer/data/dto/owner-review-query-result.dto';

export type GetOwnerReviewQueryDomainErrors = DataNotFoundDomainError;

export type GetOwnerReviewQueryResult = Either<GetOwnerReviewQueryDomainErrors, OwnerReviewQueryResult>;

export type GetOwnerReviewQueryIO = EitherIO<GetOwnerReviewQueryDomainErrors, OwnerReviewQueryResult>;

export abstract class GetOwnerReviewQueryDomain {
  abstract getOwnerReviewQueryByVehicle(fipeId: string, modelYear: number): GetOwnerReviewQueryIO;
}
