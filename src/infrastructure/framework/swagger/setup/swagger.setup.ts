/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/naming-convention */
import { getSchemaPath } from '@nestjs/swagger';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export type SwaggerSchema = SchemaObject & Partial<ReferenceObject>;

export type SwaggerSchemaWrapperExtras = {
  readonly status?: number;
  readonly description?: string;
};

export type SwaggerSchemaWrapper = {
  readonly usedDtos: ReadonlyArray<Function>;
  readonly schema: SwaggerSchema;
  readonly extras?: SwaggerSchemaWrapperExtras;
};

export type SchemaInput = SwaggerSchemaWrapper | Function;

export interface SchemaInputBox {
  readonly schemaOrDto: SchemaInput;
}

export type SwaggerSchemaBuilder<AType extends SchemaInputBox> = (...args: ReadonlyArray<AType>) => AType;

export function buildSchemaInput(
  childrenSchemas: ReadonlyArray<SwaggerSchemaWrapper>,
  schema: SwaggerSchema,
): SchemaInput {
  return {
    schema,
    usedDtos: childrenSchemas.flatMap((schemaInput: SchemaInput) =>
      typeof schemaInput !== 'function' ? schemaInput.usedDtos : [schemaInput],
    ),
    extras: childrenSchemas[0]?.extras,
  };
}

export function apiSchemaSwitcher(ofWhat: SchemaInput): SwaggerSchemaWrapper {
  const schema: SchemaObject = typeof ofWhat !== 'function' ? ofWhat.schema : { $ref: getSchemaPath(ofWhat) };
  const usedDtos: ReadonlyArray<Function> = typeof ofWhat !== 'function' ? ofWhat.usedDtos : [ofWhat];
  return { usedDtos, schema };
}
