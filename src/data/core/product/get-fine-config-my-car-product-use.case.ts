import { Injectable } from '@nestjs/common';

import { GetAttributesMyCarProductUseCase } from './get-attributes-my-car-product-use.case';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { GetFineIO, GetFineMyCarProductDomain } from 'src/domain/core/product/get-alert-fine-config.domain';

@Injectable()
export class GetFineConfigMyCarProductUseCase
  extends GetAttributesMyCarProductUseCase
  implements GetFineMyCarProductDomain
{
  getFineConfig(carId: string, userId: string): GetFineIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this.getAttributes(carId, userId, {
        only: ['fineConfig'],
      }).unsafeRun(),
    ).map((myCarProductWithUser: Partial<MyCarProductDto>) => ({
      isEnabled: myCarProductWithUser.fineConfig.isEnabled,
      notificationChannels: myCarProductWithUser.fineConfig.notificationChannels,
    }));
  }
}
