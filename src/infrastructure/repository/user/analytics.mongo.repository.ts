import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { AnalyticsDto } from 'src/domain/_layer/data/dto/analytics.dto';
import { AnalyticsRepository } from 'src/domain/_layer/infrastructure/repository/analytics.repository';
import { MAnalytics, MAnalyticsDocument } from 'src/infrastructure/model/analytics.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';
import { AnalyticsEntity } from 'src/domain/_entity/analytics.entity';

@Injectable()
export class AnalyticsMongoRepository
  extends MongoBaseRepository<AnalyticsDto, MAnalytics>
  implements AnalyticsRepository<ClientSession>
{
  constructor(@InjectModel(MAnalytics.name) public readonly model: Model<MAnalyticsDocument>) {
    super();
  }

  override fromDtoToSchema(dto: Partial<AnalyticsEntity>): Partial<MAnalytics> {
    return {
      email: dto.email,
      link: dto.link,
      placa: dto.placa,
      queryId: dto.queryId ? this.parseStringToObjectId(dto.queryId) : null,
      deletedAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
    };
  }

  override fromSchemaToDto(schema: WithId<MAnalytics>): AnalyticsEntity {
    return {
      id: schema.id,
      email: schema.email,
      link: schema.link,
      placa: schema.placa,
      queryId: schema.queryId ? this.parseObjectIdToString(schema.queryId) : null,
      deletedAt: schema.deletedAt?.toISOString(),
    };
  }
}
