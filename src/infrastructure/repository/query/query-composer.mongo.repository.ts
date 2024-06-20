import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { QueryComposeStatus, QueryComposerEntity } from 'src/domain/_entity/query-composer.entity';
import { QueryComposerDto } from '../../../domain/_layer/data/dto/query-composer.dto';
import { QueryComposerRepository } from '../../../domain/_layer/infrastructure/repository/query-composer.repository';
import { MQueryComposer, MQueryComposerDocument } from '../../model/query-composer.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class QueryComposerMongoRepository
  extends MongoBaseRepository<QueryComposerDto, MQueryComposer>
  implements QueryComposerRepository<ClientSession>
{
  constructor(@InjectModel(MQueryComposer.name) readonly model: Model<MQueryComposerDocument>) {
    super();
    this.model = model;
  }

  getBatchByCodes(codes: readonly string[]): Promise<ReadonlyArray<QueryComposerEntity>> {
    return this.getManyBy({ queryCode: { $in: codes } });
  }

  fromDtoToSchema(dto: Partial<QueryComposerDto>): MQueryComposer {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      status: dto.status === QueryComposeStatus.ACTIVATED,
      queryCode: dto.queryCode,
      name: dto.name,
      type: dto.queryType,
      isRecommended: dto.isRecommended,
      isNewFeature: dto.isNewFeature,
      showInComparisonTable: dto.showInComparisonTable,
      fullDescription: dto.fullDescription,
      shortDescription: dto.shortDescription,
      faq: dto.faqIds?.map(this.parseStringToObjectId),
      queryInfos: dto.queryInfoIds?.map(this.parseStringToObjectId),
      testimonials: dto.testimonialIds?.map(this.parseStringToObjectId),
      exampleQuery: this.parseStringToObjectId(dto.exampleQueryId),
      services: dto.serviceIds?.map(this.parseStringToObjectId),
      queryMap: this.parseStringToObjectId(dto.queryMapId),
      queryRules: this.parseStringToObjectId(dto.queryRulesId),
      buyable: dto.buyable,
      canBeTestDrive: dto.canBeTestDrive,
    };
  }

  fromSchemaToDto(schema: WithId<MQueryComposer>): QueryComposerDto {
    return {
      id: schema.id,
      createdAt: schema.createAt?.toISOString(),
      status: schema.status ? QueryComposeStatus.ACTIVATED : QueryComposeStatus.DISABLED,
      queryCode: schema.queryCode,
      name: schema.name,
      queryType: schema.type,
      isRecommended: schema.isRecommended,
      isNewFeature: schema.isNewFeature,
      showInComparisonTable: schema.showInComparisonTable,
      fullDescription: schema.fullDescription,
      shortDescription: schema.shortDescription,
      faqIds: schema.faq.map(this.parseObjectIdToString),
      queryInfoIds: schema.queryInfos.map(this.parseObjectIdToString),
      testimonialIds: schema.testimonials.map(this.parseObjectIdToString),
      exampleQueryId: this.parseObjectIdToString(schema.exampleQuery),
      serviceIds: schema.services.map(this.parseObjectIdToString),
      queryMapId: this.parseObjectIdToString(schema.queryMap),
      queryRulesId: this.parseObjectIdToString(schema.queryRules),
      buyable: schema.buyable,
      canBeTestDrive: schema.canBeTestDrive,
    };
  }

  getByQueryCode(queryCode: number): Promise<QueryComposerDto> {
    return this.getBy({ queryCode });
  }
}
