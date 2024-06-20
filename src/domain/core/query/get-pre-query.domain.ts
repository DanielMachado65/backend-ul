import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PreQueryDto } from 'src/domain/_layer/data/dto/pre-query.dto';

export type GetPreQueryDomainErrors = UnknownDomainError;

export type GetPreQueryResult = Either<GetPreQueryDomainErrors, PreQueryDto>;

export type GetPreQueryIO = EitherIO<GetPreQueryDomainErrors, PreQueryDto>;

export type PreQueryInputDto = {
  plate: string;
  chassis: string;
  engineNumber: string;
};

export abstract class GetPreQueryDomain {
  abstract getPreQuery(input: Partial<PreQueryInputDto>): GetPreQueryIO;
}
