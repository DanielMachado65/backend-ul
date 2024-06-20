import { PostalCodeInfo } from '../../data/dto/postal-code-info.dto';

export abstract class QueryPostalCodeService {
  abstract queryPostalCode(onlyNumberCode: string): Promise<PostalCodeInfo | null>;
}
