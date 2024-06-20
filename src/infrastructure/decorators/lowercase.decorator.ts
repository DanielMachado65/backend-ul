import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function LowerCase(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }: { readonly value: string }) => {
      return value.toLowerCase();
    }),
  );
}
