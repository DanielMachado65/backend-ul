import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CityZipCodeDto } from 'src/domain/_layer/data/dto/city-zipcode.dto';
import { CityZipCodeRepository } from 'src/domain/_layer/infrastructure/repository/city-zipcode.repository';
import { MCityZipCodes, MCityZipCodesDocument } from 'src/infrastructure/model/city-zipcode.model';
import { MongoBaseRepository, WithId } from 'src/infrastructure/repository/mongo.repository';

export class CityZipCodeMongoRepository
  extends MongoBaseRepository<CityZipCodeDto, MCityZipCodes>
  implements CityZipCodeRepository
{
  constructor(@InjectModel(MCityZipCodes.name) readonly model: Model<MCityZipCodesDocument>) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<CityZipCodeDto>): Partial<MCityZipCodes> {
    return {
      city: dto.city,
      state: dto.state,
      zipcode: dto.zipcode,
    };
  }

  fromSchemaToDto(schema: WithId<MCityZipCodes>): CityZipCodeDto {
    return {
      city: schema.city,
      state: schema.state,
      zipcode: schema.zipcode,
    };
  }

  async findZipCodeByCityName(userCity: string): Promise<CityZipCodeDto> {
    const city: string = userCity
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();

    const result: CityZipCodeDto = await this.getBy({ city });
    return result;
  }
}
