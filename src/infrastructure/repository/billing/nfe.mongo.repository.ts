import { Injectable } from '@nestjs/common';
import { MongoBaseRepository, WithId } from '../mongo.repository';
import { NfeDto } from '../../../domain/_layer/data/dto/nfe.dto';
import { MNfe, MNfeDocument } from '../../model/nfe.model';
import { NfeRepository } from '../../../domain/_layer/infrastructure/repository/nfe.repository';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NfeStatus } from '../../../domain/_entity/nfe.entity';
import { Currency, CurrencyUtil } from '../../util/currency.util';

@Injectable()
export class NfeMongoRepository extends MongoBaseRepository<NfeDto, MNfe> implements NfeRepository<ClientSession> {
  constructor(
    @InjectModel(MNfe.name) readonly model: Model<MNfeDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<NfeDto>): Partial<MNfe> {
    return {
      status: dto.status,
      description: dto.description,
      xmlLink: dto.xmlLink,
      pdfLink: dto.pdfLink,
      value: this._currencyUtil.numToCurrency(dto.valueInCents, Currency.CENTS_PRECISION).toFloat(),
      user: this.parseStringToObjectId(dto.userId),
      payment: this.parseStringToObjectId(dto.paymentId),
      externalNfeId: dto.externalNfeId,
      cnpj: dto.cnpj,
      isManuallyGenerated: dto.isManuallyGenerated,
      number: dto.number,
      confirmationNumber: dto.confirmationNumber,
    };
  }

  fromSchemaToDto(schema: WithId<MNfe>): NfeDto {
    return {
      id: schema.id,
      status: schema.status as NfeStatus,
      description: schema.description,
      xmlLink: schema.xmlLink,
      pdfLink: schema.pdfLink,
      valueInCents: this._currencyUtil.numToCurrency(schema.value).toInt(),
      userId: this.parseObjectIdToString(schema.user),
      paymentId: this.parseObjectIdToString(schema.payment),
      externalNfeId: schema.externalNfeId,
      cnpj: schema.cnpj,
      isManuallyGenerated: schema.isManuallyGenerated,
      number: schema.number,
      confirmationNumber: schema.confirmationNumber,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      createdAt: schema.createdAt?.toISOString(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updatedAt: schema.updatedAt?.toISOString(),
    };
  }
}
