import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';

export type AutomateQueryErrros = UnknownDomainError;

export type AutomateQueryIO = EitherIO<AutomateQueryErrros, void>;

export abstract class AutomateQueryDomain {
  abstract saveResponseQuery(query: QueryDto): AutomateQueryIO;
}
