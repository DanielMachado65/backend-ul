import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  PaymentSplittingAbsoluteRule,
  PaymentSplittingPercentRule,
  PaymentSplittingType,
} from 'src/domain/_entity/payment-management.entity';
import { PaymentManagementDto } from 'src/domain/_layer/data/dto/payment-management.dto';
import { PaymentManagementRepository } from 'src/domain/_layer/infrastructure/repository/payment-managament.repository';
import {
  MPaymentSplittingRule,
  MPaymentsManagement,
  MPaymentsManagementDocument,
} from 'src/infrastructure/model/payment-management.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class PaymentManagementMongoRepository
  extends MongoBaseRepository<PaymentManagementDto, MPaymentsManagement>
  implements PaymentManagementRepository<ClientSession>
{
  constructor(@InjectModel(MPaymentsManagement.name) readonly model: Model<MPaymentsManagementDocument>) {
    super();
    this.model = model;
  }

  override fromDtoToSchema(dto: Partial<PaymentManagementDto>): Partial<MPaymentsManagement> {
    const schema: Partial<MPaymentsManagement> =
      dto.splittingType === PaymentSplittingType.ABSOLUTE
        ? {
            splittingType: dto.splittingType as PaymentSplittingType,
            fillingOrder: dto.fillingOrder,
            rules: dto.rules?.map((rule: PaymentSplittingAbsoluteRule) => ({
              cnpj: rule.cnpj,
              maxValueCents: rule.maxValueCents,
              fillOrder: rule.fillOrder,
              percent: 0,
            })),
          }
        : {
            splittingType: dto.splittingType as PaymentSplittingType,
            rules: dto.rules?.map((rule: PaymentSplittingPercentRule) => ({
              cnpj: rule.cnpj,
              maxValueCents: 0,
              fillOrder: 0,
              percent: rule.percent,
            })),
          };

    // eslint-disable-next-line functional/immutable-data
    if (dto.createdAt) schema.createdAt = new Date(dto.createdAt);

    return schema;
  }

  override fromSchemaToDto(schema: WithId<MPaymentsManagement>): PaymentManagementDto {
    return schema.splittingType === PaymentSplittingType.ABSOLUTE
      ? {
          id: schema.id,
          splittingType: schema.splittingType,
          fillingOrder: schema.fillingOrder,
          rules: schema.rules?.map((rule: MPaymentSplittingRule) => ({
            cnpj: rule.cnpj,
            maxValueCents: rule.maxValueCents,
            fillOrder: rule.fillOrder,
          })),
          createdAt: schema.createdAt?.toISOString(),
        }
      : {
          id: schema.id,
          splittingType: schema.splittingType,
          rules: schema.rules?.map((rule: MPaymentSplittingRule) => ({
            cnpj: rule.cnpj,
            percent: rule.percent,
          })),
          createdAt: schema.createdAt?.toISOString(),
        };
  }

  async getCurrent(): Promise<PaymentManagementDto> {
    const document: MPaymentsManagement = await this.model.findOne().lean().sort({ createdAt: -1 }).exec();
    return document && this.normalize(document);
  }
}
