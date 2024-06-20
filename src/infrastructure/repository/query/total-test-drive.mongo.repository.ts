import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TotalTestDriveEntity } from 'src/domain/_entity/total-test-drive.entity';
import { TotalTestDriveDto } from 'src/domain/_layer/data/dto/total-test-drive.dto';
import { TotalTestDriveRepository } from 'src/domain/_layer/infrastructure/repository/total-test-drive.repository';
import { MTotalTestDrive, MTotalTestDriveDocument } from 'src/infrastructure/model/total-test-drive.model';
import { MongoBaseRepository } from 'src/infrastructure/repository/mongo.repository';

@Injectable()
export class TotalTestDriveMongoRepository
  extends MongoBaseRepository<TotalTestDriveDto, MTotalTestDrive>
  implements TotalTestDriveRepository
{
  constructor(@InjectModel(MTotalTestDrive.name) readonly model: Model<MTotalTestDriveDocument>) {
    super();
    this.model = model;
  }

  override fromDtoToSchema(dto: Partial<TotalTestDriveEntity>): Partial<MTotalTestDrive> {
    return {
      total: dto.total,
      createdAt: dto.createdAt,
    };
  }

  override fromSchemaToDto(schema: MTotalTestDrive): TotalTestDriveEntity {
    return {
      total: schema.total,
      createdAt: schema.createdAt,
    };
  }

  async getCurrent(): Promise<TotalTestDriveEntity> {
    const result: MTotalTestDrive = await this.model.findOne().sort({ _id: -1 });
    return this.fromSchemaToDto(result);
  }
}
