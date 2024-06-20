import { Injectable } from '@nestjs/common';
import { QueryParserService } from '../../../domain/_layer/infrastructure/service/query-parser.service';
import { ClientType } from '../../../domain/_entity/client.entity';
import { QueryParsedData } from '../../../domain/_entity/query-representation.entity';

@Injectable()
export class QueryRosettaMockService implements QueryParserService {
  private readonly _baseUrl: string;

  async parseQuery(
    queryCode: number,
    clientType: ClientType,
    responseJson: unknown,
    _templateVersion: number = 0,
  ): Promise<QueryParsedData> {
    return {
      code: queryCode,
      badges: [
        {
          code: '',
          status: '',
          fields: [],
          actions: [],
          options: {},
        },
      ],
      components: [
        clientType === ClientType.WEBSITE
          ? {
              code: '',
              size: 'big',
              isPrintable: true,
              fields: [],
              actions: [],
              options: {},
            }
          : {
              code: '',
              size: 'small',
              isPrintable: true,
              fields: [],
              actions: [],
              options: {},
            },
      ],
      products: [
        {
          code: '',
          size: '',
          isPrintable: false,
          fields: [],
          actions: [],
          options: {},
        },
      ],
    };
  }
}
