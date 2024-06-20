import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { ConsumptionStatementDto } from '../../../domain/_layer/data/dto/consumption-statement.dto';
import { ConsumptionStatementRepository } from '../../../domain/_layer/infrastructure/repository/consumption-statement.repository';
import { MConsumptionStatement, MConsumptionStatementDocument } from '../../model/consumption-statement.model';
import { Currency, CurrencyUtil } from '../../util/currency.util';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class ConsumptionStatementMongoRepository
  extends MongoBaseRepository<ConsumptionStatementDto, MConsumptionStatement>
  implements ConsumptionStatementRepository<ClientSession>
{
  constructor(
    @InjectModel(MConsumptionStatement.name) readonly model: Model<MConsumptionStatementDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<ConsumptionStatementDto>): Partial<MConsumptionStatement> {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      billing: this.parseStringToObjectId(dto.billingId),
      query: this.parseStringToObjectId(dto.queryId),
      querycode: dto.queryCode,
      description: dto.description,
      tag: dto.tag,
      status: dto.isPaid,
      value: this._currencyUtil.numToCurrency(dto.valueInCents, Currency.CENTS_PRECISION).toFloat(),
      payday: dto.payDay ? new Date(dto.payDay) : null,
    };
  }

  fromSchemaToDto(schema: WithId<MConsumptionStatement>): ConsumptionStatementDto {
    return {
      id: schema.id,
      queryCode: schema.querycode,
      description: schema.description,
      tag: schema.tag,
      isPaid: schema.status,
      valueInCents: this._currencyUtil.numToCurrency(schema.value).toInt(),
      createdAt: schema.createAt?.toISOString(),
      payDay: schema.payday?.toISOString(),
      billingId: this.parseObjectIdToString(schema.billing),
      queryId: this.parseObjectIdToString(schema.query),
    };
  }

  async getByQueryId(queryId: string): Promise<ConsumptionStatementDto | null> {
    return this.getBy({ query: queryId });
  }
}
