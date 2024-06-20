import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { FaqEssentialsEntity } from 'src/domain/_entity/faq.entity';
import { FaqDto } from 'src/domain/_layer/data/dto/faq.dto';
import { FaqRepository } from 'src/domain/_layer/infrastructure/repository/faq.repository';
import { MCompany, MCompanyDocument } from 'src/infrastructure/model/company.model';
import { MFaq, MFaqDocument } from 'src/infrastructure/model/faq.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class FaqMongoRepository extends MongoBaseRepository<FaqDto, MFaq> implements FaqRepository<ClientSession> {
  constructor(
    @InjectModel(MFaq.name) public readonly model: Model<MFaqDocument>,
    @InjectModel(MCompany.name) public readonly companyModel: Model<MCompanyDocument>,
  ) {
    super();
  }

  fromDtoToSchema(dto: Partial<FaqDto>): MFaq {
    return {
      title: dto.title,
      answer: dto.answer,
      type: dto.type,
      deleteAt: dto.deletedAt,
      updateAt: dto.updatedAt,
      createAt: dto.createdAt,
    };
  }

  fromSchemaToDto(schema: WithId<MFaq>): FaqDto {
    return {
      id: schema.id,
      title: schema.title,
      answer: schema.answer,
      type: schema.type,
      deletedAt: schema.deleteAt,
      updatedAt: schema.updateAt,
      createdAt: schema.createAt,
    };
  }

  async getAllFromCompanies(): Promise<readonly FaqEssentialsEntity[]> {
    const faqModels: ReadonlyArray<MFaq> = await this.companyModel.aggregate([
      {
        $lookup: {
          from: 'mfaqs',
          localField: 'faq',
          foreignField: '_id',
          as: 'faq',
        },
      },
      {
        $unwind: '$faq',
      },
      {
        $replaceRoot: {
          newRoot: '$faq',
        },
      },
      {
        $match: {
          deleteAt: null,
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          answer: 1,
          type: 1,
        },
      },
    ]);
    return this.normalizeArray(faqModels);
  }
}
