import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { QueryInfoEssentialsEntity } from 'src/domain/_entity/query-info.entity';
import { QueryInfoDto } from 'src/domain/_layer/data/dto/query-info.dto';
import { QueryInfoRepository } from 'src/domain/_layer/infrastructure/repository/query-info.repository';
import { MQueryInfo, MQueryInfoDocument } from 'src/infrastructure/model/query-info.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class QueryInfoMongoRepository
  extends MongoBaseRepository<QueryInfoDto, MQueryInfo>
  implements QueryInfoRepository<ClientSession>
{
  constructor(@InjectModel(MQueryInfo.name) public readonly model: Model<MQueryInfoDocument>) {
    super();
  }

  fromDtoToSchema(dto: Partial<QueryInfoDto>): MQueryInfo {
    return {
      image: dto.image,
      name: dto.name,
      description: dto.description,
      isAvailable: dto.isAvailable,
      isAvailableToOthers: dto.isAvailableToOthers,
      deleteAt: dto.deletedAt,
      createAt: dto.createdAt,
      updateAt: dto.updatedAt,
    };
  }

  fromSchemaToDto(schema: WithId<MQueryInfo>): QueryInfoDto {
    return {
      image: schema.image,
      name: schema.name,
      description: schema.description,
      isAvailable: schema.isAvailable,
      isAvailableToOthers: schema.isAvailableToOthers,
      deletedAt: schema.deleteAt,
      createdAt: schema.createAt,
      updatedAt: schema.updateAt,
    };
  }

  async getAllActive(): Promise<readonly QueryInfoEssentialsEntity[]> {
    const queryInfoModels: ReadonlyArray<Partial<MQueryInfo>> = await this.model
      .find(
        { deleteAt: null },
        {
          _id: 0,
          name: 1,
          isAvailable: 1,
          isAvailableToOthers: 1,
          description: 1,
        },
      )
      .lean()
      .exec();

    return this.normalizeArray(queryInfoModels);
  }
}
