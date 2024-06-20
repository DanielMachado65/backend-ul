import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VersionAppControlEntity } from 'src/domain/_entity/version-app.control.entity';

import { VersionAppControlDto } from 'src/domain/_layer/data/dto/version-app-control.dto';
import { VersionAppControlRepository } from 'src/domain/_layer/infrastructure/repository/version-app-control';
import { MVersionAppControl, MVersionAppControlDocument } from 'src/infrastructure/model/version-app-control.model';
import { MongoBaseRepository, WithId } from 'src/infrastructure/repository/mongo.repository';

@Injectable()
export class VersionAppControlMongoRepository
  extends MongoBaseRepository<VersionAppControlDto, MVersionAppControl>
  implements VersionAppControlRepository
{
  constructor(@InjectModel(MVersionAppControl.name) readonly model: Model<MVersionAppControlDocument>) {
    super();
    this.model = model;
  }

  override fromDtoToSchema(dto: Partial<VersionAppControlEntity>): Partial<MVersionAppControl> {
    return {
      deviceType: dto.deviceType,
      currentVersion: dto.currentVersion,
    };
  }

  override fromSchemaToDto(schema: WithId<MVersionAppControl>): VersionAppControlEntity {
    return {
      deviceType: schema.deviceType,
      currentVersion: schema.currentVersion,
    };
  }

  async getByDeviceType(deviceType: string): Promise<VersionAppControlEntity> {
    return this.model.findOne({ deviceType });
  }
}
