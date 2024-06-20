import { Injectable } from '@nestjs/common';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MongoBaseRepository, WithId } from '../mongo.repository';
import { FeedbackDto, InputFeedbackDto } from '../../../domain/_layer/data/dto/feedback.dto';
import { MFeedback, MFeedbackDocument } from '../../model/feedback.model';
import { FeedbackQueryRepository } from '../../../domain/_layer/infrastructure/repository/feedback-query.repository';
import { FeedbackEntity } from '../../../domain/_entity/feedback.entity';

@Injectable()
export class FeedbackQueryMongoRepository
  extends MongoBaseRepository<FeedbackDto, MFeedback>
  implements FeedbackQueryRepository<ClientSession>
{
  constructor(@InjectModel(MFeedback.name) readonly model: Model<MFeedbackDocument>) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<FeedbackEntity>): Partial<MFeedback> {
    return {
      user: this.parseStringToObjectId(dto.user),
      query: this.parseStringToObjectId(dto.query),
      evaluation: dto.evaluation,
      description: dto.description,
      refMonth: dto.refMonth,
      refYear: dto.refYear,
      createdAt: dto.createdAt,
    };
  }

  fromSchemaToDto(schema: WithId<MFeedback>): FeedbackDto {
    return {
      id: schema.id,
      user: this.parseObjectIdToString(schema.user),
      query: this.parseObjectIdToString(schema.query),
      evaluation: schema.evaluation,
      description: schema.description,
      refMonth: schema.refMonth,
      refYear: schema.refYear,
      createdAt: schema.createdAt,
    };
  }

  async findOneByQueryId(userId: string, queryId: string): Promise<Readonly<FeedbackDto>> {
    return this.getBy({ $and: [{ user: userId }, { query: queryId }] });
  }

  async updateFeedback(inputDto: InputFeedbackDto): Promise<FeedbackDto> {
    return await this.updateBy(
      { $and: [{ query: inputDto.queryId, user: inputDto.userId }] },
      {
        evaluation: inputDto.evaluation,
        description: inputDto.description,
        refMonth: inputDto.refMonth,
        refYear: inputDto.refYear,
      },
    );
  }

  private async _insertFeedback(inputDto: InputFeedbackDto): Promise<FeedbackDto> {
    return this.insert({
      user: inputDto.userId,
      query: inputDto.queryId,
      evaluation: inputDto.evaluation,
      description: inputDto.description,
      refMonth: inputDto.refMonth,
      refYear: inputDto.refYear,
    });
  }

  async sendFeedback(inputDto: InputFeedbackDto): Promise<FeedbackDto> {
    const hasFeedback: FeedbackDto = await this.findOneByQueryId(inputDto.userId, inputDto.queryId);
    if (hasFeedback) return this.updateFeedback(inputDto);
    return this._insertFeedback(inputDto);
  }
}
