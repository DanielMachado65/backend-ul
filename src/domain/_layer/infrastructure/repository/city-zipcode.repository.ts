import { CityZipCodeDto } from 'src/domain/_layer/data/dto/city-zipcode.dto';
import { IBaseRepository } from 'src/domain/_layer/infrastructure/repository/base.repository';

export abstract class CityZipCodeRepository<TransactionReference = unknown>
  implements IBaseRepository<CityZipCodeDto, TransactionReference>
{
  insert: (inputDto: Partial<CityZipCodeDto>, transactionReference?: TransactionReference) => Promise<CityZipCodeDto>;

  abstract getById(id: string): Promise<CityZipCodeDto>;

  abstract insertMany(
    inputs: readonly Partial<CityZipCodeDto>[],
    transactionReference?: TransactionReference,
  ): Promise<readonly CityZipCodeDto[]>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<CityZipCodeDto>;

  abstract updateById(
    id: string,
    updateDto: Partial<CityZipCodeDto>,
    transactionReference?: TransactionReference,
  ): Promise<CityZipCodeDto>;

  abstract count(): Promise<number>;

  abstract findZipCodeByCityName(city: string): Promise<CityZipCodeDto>;
}
