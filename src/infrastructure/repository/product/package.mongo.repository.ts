import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { PackageEntity } from 'src/domain/_entity/package.entity';
import { PackageDto } from 'src/domain/_layer/data/dto/package.dto';
import { PackageRepository } from 'src/domain/_layer/infrastructure/repository/package.repository';
import { MPackage, MPackageDocument } from 'src/infrastructure/model/package.model';
import { Currency, CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class PackageMongoRepository
  extends MongoBaseRepository<PackageDto, MPackage>
  implements PackageRepository<ClientSession>
{
  constructor(
    @InjectModel(MPackage.name) readonly model: Model<MPackageDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
  }

  getBatchByIds(ids: readonly string[]): Promise<readonly PackageEntity[]> {
    return this.getManyBy({ _id: { $in: ids } });
  }

  async getAll(): Promise<readonly PackageEntity[]> {
    const documents: ReadonlyArray<MPackage> = await this.model.find({ status: true }).lean().exec();
    return this.normalizeArray(documents);
  }

  fromDtoToSchema(dto: Partial<PackageEntity>): Partial<MPackage> {
    return {
      status: dto.status,
      createAt: dto.createAt && new Date(dto.createAt),
      purchasePrice: this._currencyUtil.numToCurrency(dto.purchasePriceInCents, Currency.CENTS_PRECISION).toFloat(),
      attributedValue: this._currencyUtil.numToCurrency(dto.attributedValueInCents, Currency.CENTS_PRECISION).toFloat(),
      name: dto.name,
      discountPercent: dto.discountPercent,
    };
  }

  fromSchemaToDto(schema: WithId<MPackage>): PackageEntity {
    return {
      id: schema.id,
      status: schema.status,
      createAt: schema.createAt?.toISOString(),
      purchasePriceInCents: this._currencyUtil.numToCurrency(schema.purchasePrice).toInt(),
      attributedValueInCents: this._currencyUtil.numToCurrency(schema.attributedValue).toInt(),
      name: schema.name,
      discountPercent: schema.discountPercent,
    };
  }
}
