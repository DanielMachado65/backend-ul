import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoPlanFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PlanOutputDto } from 'src/domain/_layer/presentation/dto/plan-availability-output.dto';
import { GetPlanAvailabilityDomain, GetPlanAvailabilityIO } from 'src/domain/core/product/get-plan-availability.domain';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { PlanAvailabilityHelper } from './plan-availability.helper';

@Injectable()
export class GetPlanAvailabilityUseCase implements GetPlanAvailabilityDomain {
  private readonly _myCarsPremiumPlanId: string;

  constructor(
    private readonly _envService: EnvService,
    private readonly _planRepository: PlanRepository,
    private readonly _userRepository: UserRepository,
    private readonly _planAvailability: PlanAvailabilityHelper,
  ) {
    this._myCarsPremiumPlanId = this._envService.get('MY_CARS_PREMIUM_PLAN_ID');
  }

  getPlanAvailability(userId: string): GetPlanAvailabilityIO {
    return this._getUserFremiumAvailability(userId).zip(
      this._getPremiumPlan(),
      (isFreePlanAvailableToBeCreated: boolean, plan: PlanOutputDto) => ({
        isFreePlanAvailableToBeCreated,
        plan,
      }),
    );
  }

  private _getUserFremiumAvailability(userId: string): EitherIO<UnknownDomainError, boolean> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId)).flatMap(
      (user: UserDto) => this._planAvailability.getUserFreemiumAvailability(user),
    );
  }

  private _getPremiumPlan(): EitherIO<UnknownDomainError | NoPlanFoundDomainError, PlanOutputDto> {
    return EitherIO.of(UnknownDomainError.toFn(), this._myCarsPremiumPlanId)
      .map((planId: string) => this._planRepository.getById(planId))
      .filter(NoPlanFoundDomainError.toFn(), Boolean)
      .map((planDto: PlanDto) => ({
        costInCents: planDto.costInCents,
        createdAt: planDto.createdAt,
        description: planDto.description,
        id: planDto.id,
        intervalFrequency: planDto.intervalFrequency,
        intervalValue: planDto.intervalValue,
        name: planDto.name,
        status: planDto.status,
        updatedAt: planDto.updatedAt,
      }));
  }
}
