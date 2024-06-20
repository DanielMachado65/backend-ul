import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { ServiceSwitching } from '../../../domain/_entity/service.entity';
import { ServiceDto } from '../../../domain/_layer/data/dto/service.dto';
import { ServiceRepository } from '../../../domain/_layer/infrastructure/repository/service.repository';
import { MQueryComposer, MQueryComposerDocument } from '../../model/query-composer.model';
import { MService, MServiceDocument, MServiceSwitching } from '../../model/service.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class ServiceMongoRepository
  extends MongoBaseRepository<ServiceDto, MService>
  implements ServiceRepository<ClientSession>
{
  constructor(
    @InjectModel(MService.name) readonly model: Model<MServiceDocument>,
    @InjectModel(MQueryComposer.name) readonly queryComposerModel: Model<MQueryComposerDocument>,
  ) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<ServiceDto>): Partial<MService> {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      status: dto.status,
      code: dto.code,
      name: dto.name,
      supplier: dto.supplier && {
        name: dto.supplier.name,
        supplierCode: dto.supplier.code,
      },
      hasAutoSwitching: dto.hasAutoSwitching,
      switching: dto.switchingServices?.map((serviceSwitching: ServiceSwitching) => ({
        supplier: serviceSwitching.supplier,
        name: serviceSwitching.name,
        service: this.parseStringToObjectId(serviceSwitching.serviceId),
        priority: serviceSwitching.priority,
      })),
      minimumPrice: null,
    };
  }

  fromSchemaToDto(schema: WithId<MService>): ServiceDto {
    return {
      id: schema.id,
      createdAt: schema.createAt?.toISOString(),
      status: schema.status,
      code: schema.code,
      name: schema.name,
      supplier: {
        name: schema.supplier?.name,
        code: schema.supplier?.supplierCode,
      },
      hasAutoSwitching: schema.hasAutoSwitching,
      switchingServices: schema.switching?.map((serviceSwitching: MServiceSwitching) => ({
        supplier: serviceSwitching.supplier,
        name: serviceSwitching.name,
        serviceId: this.parseObjectIdToString(serviceSwitching.service),
        priority: serviceSwitching.priority,
      })),
      minimumPrice: schema.minimumPrice,
    };
  }

  getByServiceCode(serviceCode: number): Promise<ServiceDto> {
    return this.getBy({ code: serviceCode });
  }

  async getBatchByQueryComposerId(queryComposerId: string): Promise<ReadonlyArray<ServiceDto>> {
    const documents: ReadonlyArray<MService> = await this.queryComposerModel.aggregate([
      { $match: { _id: this.parseStringToObjectId(queryComposerId) } },
      { $lookup: { from: 'mservices', localField: 'services', foreignField: '_id', as: 'services' } },
      { $unwind: '$services' },
      { $replaceRoot: { newRoot: '$services' } },
    ]);
    return documents.map(this.normalize.bind(this));
  }

  async getManyByServicesCodes(servicesCodes: readonly number[]): Promise<ReadonlyArray<ServiceDto>> {
    const documents: ReadonlyArray<MService> = await this.model.find({
      code: {
        $in: servicesCodes,
      },
    });

    return documents.map(this.normalize.bind(this));
  }
}
