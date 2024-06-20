/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/naming-convention */

import { HttpException, Type } from '@nestjs/common';
import { getSchemaPath } from '@nestjs/swagger';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { None } from 'src/domain/_entity/none.entity';
import { DomainError } from 'src/domain/_entity/result.error';
import { ErrorReponseDto } from 'src/domain/_layer/data/dto/error-response.dto';
import { SwaggerSchemaWrapper } from '../setup/swagger.setup';

export const ApiError = (
  errorType?: Type<DomainError & HttpException>,
  detailsType: Function = None,
): SwaggerSchemaWrapper => {
  const error: DomainError & HttpException = new errorType();
  const statusCode: number = error.getStatus();
  const tag: string = error.tag;
  const description: string = error.description;

  const response: Omit<ErrorReponseDto, 'details'> = {
    path: '/',
    timestamp: new Date().toISOString(),
    statusCode,
    tag,
    description,
  };

  let properties: Record<string, SchemaObject | ReferenceObject> = {
    details: {
      $ref: getSchemaPath(detailsType),
    },
  };
  // eslint-disable-next-line prefer-const
  for (let key in response) {
    properties = { ...properties, [key]: { example: response[key] } };
  }

  return { usedDtos: [detailsType], schema: { properties }, extras: { status: statusCode, description } };
};
