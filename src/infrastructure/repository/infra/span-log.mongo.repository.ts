import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { SpanLogDto } from 'src/domain/_layer/data/dto/span-log.dto';
import { SpanLogRepository } from 'src/domain/_layer/infrastructure/repository/span-log.repository';
import { MSpanLog, MSpanLogDocument } from 'src/infrastructure/model/span-log.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class SpanLogMongoRepository
  extends MongoBaseRepository<SpanLogDto, MSpanLog>
  implements SpanLogRepository<ClientSession>
{
  constructor(@InjectModel(MSpanLog.name) readonly model: Model<MSpanLogDocument>) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<SpanLogDto>): Partial<MSpanLog & { readonly _id: unknown }> {
    return {
      _id: dto.id ? this.parseStringToObjectId(dto.id) : undefined,
      traceId: this.parseStringToObjectId(dto.traceId),
      traceName: dto.traceName,
      targetName: dto.targetName,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      spanTime: dto.spanTime,
      isSuccess: dto.isSuccess,
      params: dto.params,
      response: dto.response,
    };
  }

  fromSchemaToDto(schema: WithId<MSpanLog>): SpanLogDto {
    return {
      id: schema.id,
      traceId: this.parseObjectIdToString(schema.traceId),
      traceName: schema.traceName,
      targetName: schema.targetName,
      startAt: schema.startAt?.toISOString(),
      endAt: schema.endAt?.toISOString(),
      spanTime: schema.spanTime,
      isSuccess: schema.isSuccess,
      params: schema.params,
      response: schema.response,
      createdAt: schema.createdAt?.toISOString(),
    };
  }
}
