import { CreditScoreEntity } from 'src/domain/_entity/credit-score.entity';

export abstract class CreditQueryRepository {
  abstract insertScore: (queryId: string, queryResult: CreditScoreEntity) => Promise<void>;
  abstract getScore(queryId: string): Promise<CreditScoreEntity | null>;
}
