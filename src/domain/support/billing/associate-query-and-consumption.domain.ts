import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoConsumptionFoundDomainError, UnknownDomainError } from '../../_entity/result.error';
import { ConsumptionStatementEntity } from '../../_entity/consumption-statement.entity';

export type AssociateQueryAndConsumptionDomainErrors = UnknownDomainError | NoConsumptionFoundDomainError;

export type AssociateQueryAndConsumptionResult = Either<
  AssociateQueryAndConsumptionDomainErrors,
  ConsumptionStatementEntity
>;

export type AssociateQueryAndConsumptionIO = EitherIO<
  AssociateQueryAndConsumptionDomainErrors,
  ConsumptionStatementEntity
>;

export abstract class AssociateQueryAndConsumptionDomain {
  readonly associateQueryAndConsumption: (consumptionId: string, queryId: string) => AssociateQueryAndConsumptionIO;
}
