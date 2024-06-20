import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { VehicleVersionSelectableOption } from 'src/domain/_layer/data/dto/vehicle-selectable-option.dto';
import { VehicleSelectableOption } from 'src/domain/_layer/infrastructure/service/owner-review.service';

export type ListAllPossibleOptionsUseCaseDomainErrors = ProviderUnavailableDomainError;

export type ListAllPossibleOptionsUseCaseResult = Either<
  ListAllPossibleOptionsUseCaseDomainErrors,
  ReadonlyArray<VehicleSelectableOption>
>;

export type ListAllPossibleOptionsUseCaseIO = EitherIO<
  ListAllPossibleOptionsUseCaseDomainErrors,
  ReadonlyArray<VehicleSelectableOption>
>;

export type ListAllPossibleOptionsV2DomainErrors = ProviderUnavailableDomainError;

export type ListAllPossibleOptionsV2Result = Either<
  ListAllPossibleOptionsUseCaseDomainErrors,
  ReadonlyArray<VehicleVersionSelectableOption>
>;

export type ListAllPossibleOptionsV2IO = EitherIO<
  ListAllPossibleOptionsUseCaseDomainErrors,
  ReadonlyArray<VehicleVersionSelectableOption>
>;

export abstract class ListAllPossibleOptionsDomain {
  abstract listAllOptions(): ListAllPossibleOptionsUseCaseIO;

  abstract listAllOptionsV2(): ListAllPossibleOptionsV2IO;
}
