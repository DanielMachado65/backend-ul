import { Injectable } from '@nestjs/common';

import { GetAttributesMyCarProductUseCase } from './get-attributes-my-car-product-use.case';
import {
  GetRevisionConfigIO,
  GetRevisionConfigMyCarProductDomain,
} from 'src/domain/core/product/get-alert-revision-plan-config.domain';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';

@Injectable()
export class GetRevisionConfigMyCarProductUseCase
  extends GetAttributesMyCarProductUseCase
  implements GetRevisionConfigMyCarProductDomain
{
  getRevisionPlanConfig(carId: string, userId: string): GetRevisionConfigIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this.getAttributes(carId, userId, {
        only: ['revisionConfig'],
      }).unsafeRun(),
    ).map((myCarProductWithUser: Partial<MyCarProductDto>) => ({
      vehicle: {
        mileageKm: myCarProductWithUser.revisionConfig.mileageKm,
        mileageKmMonthly: myCarProductWithUser.revisionConfig.mileageKmMonthly,
      },
      notificationChannels: myCarProductWithUser.revisionConfig.notificationChannels,
      notificationConfig: {
        shouldNotify30DaysBefore: myCarProductWithUser.revisionConfig.shouldNotify30DaysBefore,
        shouldNotify7DaysBefore: myCarProductWithUser.revisionConfig.shouldNotify7DaysBefore,
        shouldNotify15DaysBefore: myCarProductWithUser.revisionConfig.shouldNotify15DaysBefore,
      },
      isEnabled: myCarProductWithUser.revisionConfig.isEnabled,
    }));
  }
}
