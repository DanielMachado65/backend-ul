/* eslint-disable @typescript-eslint/naming-convention */

import { DataReponseDto } from 'src/domain/_layer/data/dto/data-response.dto';
import { SchemaInput, apiSchemaSwitcher, SwaggerSchemaWrapper, buildSchemaInput } from '../setup/swagger.setup';

export const ApiData = (ofWhat: SchemaInput): SchemaInput => {
  const dataDto: SwaggerSchemaWrapper = apiSchemaSwitcher(DataReponseDto);
  const data: SwaggerSchemaWrapper = apiSchemaSwitcher(ofWhat);
  return buildSchemaInput([dataDto, data], {
    allOf: [
      dataDto.schema,
      {
        properties: {
          data: data.schema,
        },
      },
    ],
  });
};
