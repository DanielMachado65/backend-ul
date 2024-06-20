import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { MongoBaseRepository, WithId } from '../mongo.repository';
import { QueryLogRepository } from '../../../domain/_layer/infrastructure/repository/query-log.repository';
import { QueryLogDto } from '../../../domain/_layer/data/dto/query-log.dto';
import { MLog, MLogDocument } from '../../model/log.model';

@Injectable()
export class QueryLogMongoRepository
  extends MongoBaseRepository<QueryLogDto, MLog>
  implements QueryLogRepository<ClientSession>
{
  constructor(@InjectModel(MLog.name) readonly model: Model<MLogDocument>) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<QueryLogDto>): MLog {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      user: this.parseStringToObjectId(dto.userId),
      query: this.parseStringToObjectId(dto.queryId),
      status: dto.status,
      error: dto.errorMessage,
      code: dto.errorCode,
    };
  }

  fromSchemaToDto(schema: WithId<MLog>): QueryLogDto {
    return {
      id: schema.id,
      createdAt: schema.createAt?.toISOString(),
      userId: this.parseObjectIdToString(schema.user),
      queryId: this.parseObjectIdToString(schema.query),
      status: schema.status,
      errorMessage: schema.error,
      errorCode: schema.code,
    };
  }

  updateByQueryId(
    queryId: string,
    updateDto: Partial<QueryLogDto>,
    transactionReference?: ClientSession,
  ): Promise<QueryLogDto> {
    return this.updateBy({ query: this.parseStringToObjectId(queryId) }, updateDto, transactionReference);
  }
}
