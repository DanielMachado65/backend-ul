import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ClientSession, Model, QueryOptions } from 'mongoose';
import {
  CouponRules,
  CouponRulesAuthorized,
  CouponRulesAuthorizedPackage,
  CouponRulesAuthorizedSignature,
} from 'src/domain/_entity/coupon.entity';
import { CouponDto } from 'src/domain/_layer/data/dto/coupon.dto';
import { CouponRepository } from 'src/domain/_layer/infrastructure/repository/coupon.repository';
import {
  MCoupon,
  MCouponDocument,
  MCouponRules,
  MCouponRulesAuthorized,
  MCouponRulesAuthorizedPackage,
  MCouponRulesAuthorizedSignature,
} from 'src/infrastructure/model/coupon.model';
import { Currency, CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class CouponMongoRepository
  extends MongoBaseRepository<CouponDto, MCoupon>
  implements CouponRepository<ClientSession>
{
  constructor(
    @InjectModel(MCoupon.name) readonly model: Model<MCouponDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
  }

  private _toCents(value: number): number {
    return this._currencyUtil.numToCurrency(value).toInt();
  }

  private _toReals(value: number): number {
    return this._currencyUtil.numToCurrency(value, Currency.CENTS_PRECISION).toFloat();
  }

  fromDtoToSchema(dto: Partial<CouponDto>): Partial<MCoupon> {
    const rules: Partial<CouponRules> = dto.rules;
    const authorized: Partial<CouponRulesAuthorized> = dto.rules?.authorized ?? {};

    return {
      creator: this.parseStringToObjectId(dto.creatorId),
      status: dto.status,
      code: dto.code,
      generator: this.parseStringToObjectId(dto.generatorId),
      rules: {
        discountPercentage: rules.discountPercentage,
        discountValue: this._toReals(rules.discountValueInCents),
        minValueToApply: this._toReals(rules.minValueToApplyInCents),
        expirationDate: rules.expirationDate ? new Date(rules.expirationDate) : null,
        limitUsage: rules.limitUsage,
        usageMaxToUser: rules.usageMaxToUser,
        authorized: {
          packages: (authorized.packages ?? []).map((pack: CouponRulesAuthorizedPackage) => ({
            packageid: this.parseStringToObjectId(pack.packageId),
            limit: pack.limit,
          })),
          queries: authorized.queries ?? [],
          signatures: (authorized.signatures ?? []).map((pack: CouponRulesAuthorizedSignature) => ({
            code: this.parseStringToObjectId(pack.code),
            limit: pack.limit,
          })),
        },
      },
      createAt: dto.createdAt && new Date(dto.createdAt),
    };
  }

  fromSchemaToDto(schema: WithId<MCoupon>): CouponDto {
    const rules: Partial<MCouponRules> = schema.rules;
    const authorized: Partial<MCouponRulesAuthorized> = schema.rules?.authorized ?? {};

    return {
      id: schema.id,
      creatorId: this.parseObjectIdToString(schema.creator),
      status: schema.status,
      code: schema.code,
      generatorId: this.parseObjectIdToString(schema.generator),
      rules: {
        discountPercentage: rules.discountPercentage,
        discountValueInCents: this._toCents(rules.discountValue),
        minValueToApplyInCents: this._toCents(rules.minValueToApply),
        expirationDate: rules.expirationDate?.toISOString(),
        limitUsage: rules.limitUsage,
        usageMaxToUser: rules.usageMaxToUser,
        authorized: {
          packages: (authorized.packages ?? []).map((pack: MCouponRulesAuthorizedPackage) => ({
            packageId: this.parseObjectIdToString(pack.packageid),
            limit: pack.limit,
          })),
          queries: authorized.queries ?? [],
          signatures: (authorized.signatures ?? []).map((pack: MCouponRulesAuthorizedSignature) => ({
            code: this.parseObjectIdToString(pack.code),
            limit: pack.limit,
          })),
        },
      },
      createdAt: schema.createAt?.toISOString(),
    };
  }

  countAllCreatedByUser(userId: string): Promise<number> {
    return this.model.find({ creator: userId }).countDocuments().exec();
  }

  async getByCode(code: string): Promise<CouponDto | null> {
    const result: MCouponDocument = await this.model
      .findOne({ code })
      .collation({ locale: 'pt', strength: 2 })
      .lean()
      .exec();
    return this.normalize(result);
  }

  async getByIdOrCode(id: string, code: string): Promise<CouponDto | null> {
    return mongoose.Types.ObjectId.isValid(id) ? this.getById(id) : this.getByCode(code);
  }

  async updateUsage(id: string, incrementBy: number, transactionReference?: ClientSession): Promise<CouponDto | null> {
    const options: QueryOptions = { new: true, runValidators: true, session: transactionReference };
    const result: MCoupon | null = await this.model
      .findByIdAndUpdate(id, { $inc: { 'rules.limitUsage': incrementBy } }, options)
      .lean()
      .exec();
    return result ? this.normalize(result) : null;
  }
}
