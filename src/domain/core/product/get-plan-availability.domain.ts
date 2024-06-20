import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { PlanAvailabilityOutputDto } from 'src/domain/_layer/presentation/dto/plan-availability-output.dto';
import { NoPlanFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type GetPlanAvailabilityDomainErrors = UnknownDomainError | NoPlanFoundDomainError;

export type GetPlanAvailabilityResult = Either<GetPlanAvailabilityDomainErrors, PlanAvailabilityOutputDto>;

export type GetPlanAvailabilityIO = EitherIO<GetPlanAvailabilityDomainErrors, PlanAvailabilityOutputDto>;

export abstract class GetPlanAvailabilityDomain {
  abstract getPlanAvailability(userId: string): GetPlanAvailabilityIO;
}
