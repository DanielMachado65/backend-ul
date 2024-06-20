import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ClientSession, Model } from 'mongoose';
import { HttpLogDto } from 'src/domain/_layer/data/dto/http-log.dto';
import { HttpLogRepository } from 'src/domain/_layer/infrastructure/repository/http-log.repository';
import { MHttpLog, MHttpLogDocument } from 'src/infrastructure/model/http-log.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class HttpLogMongoRepository
  extends MongoBaseRepository<HttpLogDto, MHttpLog>
  implements HttpLogRepository<ClientSession>
{
  constructor(@InjectModel(MHttpLog.name) readonly model: Model<MHttpLogDocument>) {
    super();
    this.model = model;
  }

  generateNewId(): string {
    return new mongoose.Types.ObjectId().toString();
  }

  fromDtoToSchema(dto: Partial<HttpLogDto>): Partial<MHttpLog & { readonly _id: unknown }> {
    return {
      _id: dto.id ? this.parseStringToObjectId(dto.id) : undefined,
      parentId: this.parseStringToObjectId(dto.parentId),
      target: dto.target,
      actor: dto.actor,
      method: dto.method,
      url: dto.url,
      statusCode: dto.statusCode,
      requestHeaders: dto.requestHeaders,
      requestParams: dto.requestParams,
      responseHeaders: dto.responseHeaders,
      responseBody: dto.responseBody,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
    };
  }

  fromSchemaToDto(schema: WithId<MHttpLog>): HttpLogDto {
    return {
      id: schema.id,
      parentId: this.parseObjectIdToString(schema.parentId),
      target: schema.target,
      actor: schema.actor,
      method: schema.method,
      url: schema.url,
      statusCode: schema.statusCode,
      requestHeaders: schema.requestHeaders,
      requestParams: schema.requestParams,
      responseHeaders: schema.responseHeaders,
      responseBody: schema.responseBody,
      startAt: schema.startAt?.toISOString(),
      endAt: schema.endAt?.toISOString(),
      createdAt: schema.createdAt?.toISOString(),
    };
  }
}
