import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { CompanyEntity, CompanyMediaEntity } from 'src/domain/_entity/company.entity';
import { CompanyDto } from 'src/domain/_layer/data/dto/company.dto';
import { CompanyRepository } from 'src/domain/_layer/infrastructure/repository/company.repository';
import { MCompany, MCompanyDocument } from 'src/infrastructure/model/company.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class CompanyMongoRepository
  extends MongoBaseRepository<CompanyDto, MCompany>
  implements CompanyRepository<ClientSession>
{
  constructor(@InjectModel(MCompany.name) public readonly model: Model<MCompanyDocument>) {
    super();
  }

  fromDtoToSchema(dto: Partial<CompanyEntity>): Partial<MCompany> {
    return {
      medias: dto.medias,
      faq: dto.faq.map(this.parseStringToObjectId),
      createAt: dto.createdAt,
      updateAt: dto.updatedAt,
    };
  }

  fromSchemaToDto(schema: WithId<MCompany>): CompanyDto {
    return {
      id: schema.id,
      medias: schema.medias,
      faq: schema.faq.map(this.parseObjectIdToString),
      createdAt: schema.createAt,
      updatedAt: schema.updateAt,
    };
  }

  async getAllMedia(): Promise<ReadonlyArray<CompanyMediaEntity>> {
    const companiesModels: ReadonlyArray<MCompany> = await this.model.find({}).lean().exec();
    const companies: ReadonlyArray<CompanyEntity> = this.normalizeArray(companiesModels);
    return companies.flatMap((company: CompanyEntity) => company.medias);
  }
}
