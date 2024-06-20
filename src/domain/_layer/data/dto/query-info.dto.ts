import { QueryInfoEntity, QueryInfoEssentialsEntity } from 'src/domain/_entity/query-info.entity';

export type QueryInfoDto = QueryInfoEntity;

export type QueryInfoEssentialsDto = QueryInfoEssentialsEntity;

export type QueryInfoWithoutTimestampsDto = Omit<QueryInfoDto, 'deletedAt' | 'updatedAt' | 'createdAt'>;
