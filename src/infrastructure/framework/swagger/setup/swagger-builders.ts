/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/naming-convention */
import { applyDecorators, HttpException, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { DomainError } from 'src/domain/_entity/result.error';
import { ApiData } from '../schemas/data.schema';
import { ApiError } from '../schemas/error.schema';
import { undefinedOkResponseStatus } from '../status-mapper';
import { apiSchemaSwitcher, SchemaInput, SwaggerSchema, SwaggerSchemaWrapper } from './swagger.setup';

export interface ApiOkResponseMakeOptions {
  readonly wrapInData: boolean;
  readonly status: number;
  readonly description: string;
}

export const defaultApiOkResponseMakeOptions: ApiOkResponseMakeOptions = {
  wrapInData: true,
  status: undefinedOkResponseStatus,
  description: 'No description provided',
};

export function ApiOkResponseMake(
  input: SchemaInput,
  gotOptions: Partial<ApiOkResponseMakeOptions> = defaultApiOkResponseMakeOptions,
): Function {
  const options: ApiOkResponseMakeOptions = { ...defaultApiOkResponseMakeOptions, ...gotOptions };
  const mayWrappedInput: SchemaInput = options.wrapInData ? ApiData(input) : apiSchemaSwitcher(input);
  const usedDtos: ReadonlyArray<Function> =
    typeof mayWrappedInput !== 'function' ? mayWrappedInput.usedDtos : [mayWrappedInput];

  const config: ApiResponseOptions = { status: options.status, description: options.description };
  return applyDecorators(
    ApiExtraModels(...usedDtos),
    ApiResponse(
      typeof mayWrappedInput !== 'function'
        ? {
            schema: mayWrappedInput.schema,
            ...config,
          }
        : {
            type: mayWrappedInput,
            ...config,
          },
    ),
  );
}

type AError = Type<DomainError & HttpException> | SwaggerSchemaWrapper;
export function ApiErrorResponseMake(oneOrMoreErrors: ReadonlyArray<AError> | AError): Function {
  const errors: ReadonlyArray<AError> = Array.isArray(oneOrMoreErrors) ? oneOrMoreErrors : [oneOrMoreErrors];
  return applyDecorators(
    ApiExtraModels(
      ...errors.flatMap((errorType: AError): ReadonlyArray<Function> => {
        if (typeof errorType === 'function') return [];
        return errorType.usedDtos;
      }),
    ),
    ...errors.map((errorType: AError) => {
      if (typeof errorType !== 'function') {
        return ApiResponse({ schema: errorType.schema, ...errorType.extras });
      }

      const errorApi: SwaggerSchemaWrapper = ApiError(errorType);
      const input: SwaggerSchema = errorApi.schema;
      const extras: ApiResponseOptions = errorApi.extras;

      return ApiResponse(
        typeof input !== 'function'
          ? {
              schema: input,
              ...extras,
            }
          : {
              type: input,
              ...extras,
            },
      );
    }),
  );
}
