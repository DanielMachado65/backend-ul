import { PostalCodeInfo, PostalCodeInfoOrigin } from 'src/domain/_layer/data/dto/postal-code-info.dto';
import { QueryPostalCodeService } from 'src/domain/_layer/infrastructure/service/query-postal-code.service';

export class ViaCepMockService implements QueryPostalCodeService {
  async queryPostalCode(onlyNumberCode: string): Promise<PostalCodeInfo> {
    return {
      postalCode: onlyNumberCode,
      street: '',
      neighborhood: '',
      city: '::city::',
      uf: 'AA',
      complement: '',
      ddd: '',
      __origin__: PostalCodeInfoOrigin.VIACEP,
    };
  }
}
