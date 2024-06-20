/* eslint-disable @typescript-eslint/naming-convention */

import { SchemaInput, apiSchemaSwitcher, buildSchemaInput, SwaggerSchemaWrapper } from '../setup/swagger.setup';

export const ApiList = (ofWhat: SchemaInput): SchemaInput => {
  const items: SwaggerSchemaWrapper = apiSchemaSwitcher(ofWhat);
  return buildSchemaInput([items], {
    type: 'array',
    items: items.schema,
  });
};
