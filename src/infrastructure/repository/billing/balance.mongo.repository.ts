import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { BalanceDto } from '../../../domain/_layer/data/dto/balance.dto';
import { BalanceRepository } from '../../../domain/_layer/infrastructure/repository/balance.repository';
import { MBalance, MBalanceDocument } from '../../model/balance.model';
import { Currency, CurrencyUtil } from '../../util/currency.util';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class BalanceMongoRepository
  extends MongoBaseRepository<BalanceDto, MBalance>
  implements BalanceRepository<ClientSession>
{
  constructor(
    @InjectModel(MBalance.name) readonly model: Model<MBalanceDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<BalanceDto>): Partial<MBalance> {
    return {
      user: this.parseStringToObjectId(dto.userId),
      assigner: {
        isSystem: !dto.assignerId,
        user: this.parseStringToObjectId(dto.assignerId),
      },
      consumptionItem: this.parseStringToObjectId(dto.consumptionItemId),
      payment: this.parseStringToObjectId(dto.paymentId),
      createAt: dto.createdAt && new Date(dto.createdAt),
      lastBalance:
        dto.lastBalanceCents &&
        this._currencyUtil.numToCurrency(dto.lastBalanceCents, Currency.CENTS_PRECISION).toFloat(),
      currentBalance:
        dto.currentBalanceCents &&
        this._currencyUtil.numToCurrency(dto.currentBalanceCents, Currency.CENTS_PRECISION).toFloat(),
      attributedValue:
        dto.attributedValueCents &&
        this._currencyUtil.numToCurrency(dto.attributedValueCents, Currency.CENTS_PRECISION).toFloat(),
    };
  }

  fromSchemaToDto(schema: WithId<MBalance>): BalanceDto {
    return {
      id: schema.id,
      createdAt: schema.createAt?.toISOString(),
      lastBalanceCents: this._currencyUtil.numToCurrency(schema.lastBalance).toInt(),
      currentBalanceCents: this._currencyUtil.numToCurrency(schema.currentBalance).toInt(),
      attributedValueCents: this._currencyUtil.numToCurrency(schema.attributedValue).toInt(),
      userId: this.parseObjectIdToString(schema.user),
      assignerId: schema.assigner?.isSystem ? this.parseObjectIdToString(schema.assigner?.user) : null,
      consumptionItemId: this.parseObjectIdToString(schema.consumptionItem),
      paymentId: this.parseObjectIdToString(schema.payment),
    };
  }

  async getUserLastBalance(userId: string): Promise<BalanceDto | null> {
    const documents: ReadonlyArray<MBalance> = await this.model
      .find({ user: userId })
      .sort({ _id: -1 })
      .limit(1)
      .lean()
      .exec();
    const result: MBalance = documents[0];
    return this.normalize(result);
  }

  async getByPaymentId(paymentId: string): Promise<BalanceDto | null> {
    return this.getBy({ payment: paymentId });
  }

  async getByConsumptionItemId(consumptionItem: string): Promise<BalanceDto | null> {
    return this.getBy({ consumptionItem });
  }
}
