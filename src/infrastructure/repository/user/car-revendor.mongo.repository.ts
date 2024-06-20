import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { CarRevendorEntity } from 'src/domain/_entity/car-revendor.entity';
import { CarRevendorDto } from 'src/domain/_layer/data/dto/car-revendor.dto';
import { CarRevendorRepository } from 'src/domain/_layer/infrastructure/repository/car-revendor.repository';
import { MCarRevendor, MCarRevendorDocument } from 'src/infrastructure/model/car-revendor.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class CarRevendorMongoRepository
  extends MongoBaseRepository<CarRevendorDto, MCarRevendor>
  implements CarRevendorRepository<ClientSession>
{
  constructor(@InjectModel(MCarRevendor.name) public readonly model: Model<MCarRevendorDocument>) {
    super();
  }

  fromDtoToSchema(dto: CarRevendorDto): MCarRevendor {
    return {
      userId: this.parseStringToObjectId(dto.userId),
      status: dto.status,
      createAt: dto.createdAt && new Date(dto.createdAt),
      updateAt: dto.updatedAt && new Date(dto.updatedAt),
    };
  }

  fromSchemaToDto(schema: WithId<MCarRevendor>): CarRevendorDto {
    return {
      id: schema.id,
      userId: this.parseObjectIdToString(schema.userId),
      status: schema.status,
      createdAt: schema.createAt?.toISOString(),
      updatedAt: schema.updateAt?.toISOString(),
    };
  }

  getByUserId(userId: string): Promise<CarRevendorEntity> {
    return this.getBy({ userId: userId });
  }
}
