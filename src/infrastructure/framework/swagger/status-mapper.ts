/* eslint-disable functional/immutable-data */
/* eslint-disable prefer-const */
import { OpenAPIObject } from '@nestjs/swagger';
import {
  OperationObject,
  PathItemObject,
  PathsObject,
  ResponsesObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const undefinedOkResponseStatus: number = -1;
const undefinedOkResponseStatusString: string = undefinedOkResponseStatus.toString();

const getStatusBasedOnMethod = (method: string): number => {
  switch (method) {
    case 'post':
      return 201;
    default:
      return 200;
  }
};

export function statusMapper(obj: OpenAPIObject): OpenAPIObject {
  const paths: PathsObject = obj.paths;
  for (let path in paths) {
    const operations: PathItemObject = paths[path];
    for (let operation in operations) {
      const operationParams: OperationObject = operations[operation];
      const responses: ResponsesObject = operationParams.responses;
      for (let responseStatus in responses) {
        if (responseStatus === undefinedOkResponseStatusString) {
          const newStatus: number = getStatusBasedOnMethod(operation);
          responses[newStatus] = responses[responseStatus];
          delete responses[responseStatus];
        }
      }
    }
  }
  return obj;
}
