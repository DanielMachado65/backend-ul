import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { TestimonialEntity, TestimonialEssentialsEntity } from 'src/domain/_entity/testimonial.entity';
import { TestimonialDto } from 'src/domain/_layer/data/dto/testimonial.dto';
import { TestimonialRepository } from 'src/domain/_layer/infrastructure/repository/testimonial.repository';
import { MTestimonial, MTestimonialDocument } from 'src/infrastructure/model/testimonial.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class TestimonialMongoRepository
  extends MongoBaseRepository<TestimonialDto, MTestimonial>
  implements TestimonialRepository<ClientSession>
{
  constructor(@InjectModel(MTestimonial.name) public readonly model: Model<MTestimonialDocument>) {
    super();
  }

  fromDtoToSchema(dto: Partial<TestimonialEntity>): MTestimonial {
    return {
      authorName: dto.authorName,
      content: dto.content,
      user: this.parseStringToObjectId(dto.userId),
      deleteAt: dto.deletedAt,
      createAt: dto.createdAt,
      updateAt: dto.updatedAt,
    };
  }

  fromSchemaToDto(schema: WithId<MTestimonial>): TestimonialEntity {
    return {
      authorName: schema.authorName,
      content: schema.content,
      userId: this.parseObjectIdToString(schema.user),
      deletedAt: schema.deleteAt,
      createdAt: schema.createAt,
      updatedAt: schema.updateAt,
    };
  }

  async getAllTestimonials(): Promise<ReadonlyArray<TestimonialEssentialsEntity>> {
    const testimonialsModels: ReadonlyArray<Partial<MTestimonial>> = await this.model
      .find({ deleteAt: null }, { _id: 0, authorName: 1, content: 1, user: 1 })
      .lean()
      .exec();
    return this.normalizeArray(testimonialsModels);
  }
}
