import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';

export type RequestOwnerReviewQueryDomainErrors = ProviderUnavailableDomainError;

export type RequestOwnerReviewQueryResult = Either<RequestOwnerReviewQueryDomainErrors, void>;

export type RequestOwnerReviewQueryIO = EitherIO<RequestOwnerReviewQueryDomainErrors, void>;

export type VehicleModel = {
  readonly brandName: string;
  readonly modelYear: number;
  readonly fipeId: string;
};

export abstract class RequestOwnerReviewQueryDomain {
  abstract requestOwnerReviewQuery(model: VehicleModel): RequestOwnerReviewQueryIO;
}
