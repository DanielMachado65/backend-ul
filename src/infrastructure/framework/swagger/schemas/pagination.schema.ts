/* eslint-disable @typescript-eslint/naming-convention */
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { apiSchemaSwitcher, buildSchemaInput, SchemaInput, SwaggerSchemaWrapper } from '../setup/swagger.setup';
import { ApiList } from './list.schema';

export const ApiPagination = (ofWhat: SchemaInput): SchemaInput => {
  const paginationDto: SwaggerSchemaWrapper = apiSchemaSwitcher(PaginationOf);
  const items: SwaggerSchemaWrapper = apiSchemaSwitcher(ApiList(ofWhat));
  return buildSchemaInput([paginationDto, items], {
    allOf: [
      paginationDto.schema,
      {
        properties: {
          items: items.schema,
        },
      },
    ],
  });
};
