import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { MongoBaseRepository, WithId } from '../mongo.repository';
import { ServiceLogRepository } from '../../../domain/_layer/infrastructure/repository/service-log.repository';
import { ServiceLogDto } from '../../../domain/_layer/data/dto/service-log.dto';
import { MServiceLog, MServiceLogDocument } from '../../model/service-log.model';

@Injectable()
export class ServiceLogMongoRepository
  extends MongoBaseRepository<ServiceLogDto, MServiceLog>
  implements ServiceLogRepository<ClientSession>
{
  constructor(@InjectModel(MServiceLog.name) readonly model: Model<MServiceLogDocument>) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<ServiceLogDto>): MServiceLog {
    return {
      log: this.parseStringToObjectId(dto.logId),
      serviceCode: dto.serviceCode,
      date: dto.createdAt && new Date(dto.createdAt),
      status: dto.status,
      error: dto.error,
      reprocessing: dto.reprocessing && {
        is: dto.reprocessing.isReprocessing,
        count: dto.reprocessing.attemptsCount,
        last: dto.reprocessing.lastRetryAt ? new Date(dto.reprocessing.lastRetryAt) : new Date(),
        originalServiceCode: dto.reprocessing.originalServiceCode,
      },
    };
  }

  fromSchemaToDto(schema: WithId<MServiceLog>): ServiceLogDto {
    return {
      id: schema.id,
      logId: this.parseObjectIdToString(schema.log),
      serviceCode: typeof schema.serviceCode === 'string' ? parseInt(schema.serviceCode) : schema.serviceCode,
      createdAt: schema.date?.toISOString(),
      status: schema.status,
      error: schema.error,
      reprocessing: schema.reprocessing && {
        isReprocessing: schema.reprocessing.is,
        attemptsCount: schema.reprocessing.count,
        lastRetryAt: schema.reprocessing.last?.toISOString(),
        originalServiceCode:
          typeof schema.reprocessing.originalServiceCode === 'string'
            ? parseInt(schema.reprocessing.originalServiceCode)
            : schema.reprocessing.originalServiceCode,
      },
    };
  }
}
