import { Injectable } from '@nestjs/common';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { OwnerReviewNotProcess, ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { CarOwnerReviewDto, OwnerReviewDto } from 'src/domain/_layer/data/dto/owner-review.dto';
import { MarkintingService } from 'src/domain/_layer/infrastructure/service/marketing.service';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { SendOwnerReviewIO, SendOwnerReviewDomain } from 'src/domain/support/owner-review/send-owner-reviews.domain';
import { StringUtil } from 'src/infrastructure/util/string.util';

@Injectable()
export class SendOwnerReviewUseCase implements SendOwnerReviewDomain {
  constructor(
    private readonly _ownerReviewService: OwnerReviewService,
    private readonly _marketingService: MarkintingService,
  ) {}

  create(keys: CarOwnerReviewDto): SendOwnerReviewIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => this._ownerReviewService.sendOwnerReview(keys))
      .filter(OwnerReviewNotProcess.toFn(), (result: OwnerReviewDto) => !!result.ranking)
      .tap(() => {
        this._sendEmailToUser(keys)
          .catch(() => ({}))
          .finally();
      })
      .map((result: OwnerReviewDto) => result);
  }

  private async _sendEmailToUser(keys: CarOwnerReviewDto): Promise<void> {
    const {
      user,
      vehicle,
      review: { license_plate: licensePlate },
    }: CarOwnerReviewDto = keys;

    const firstName: string = StringUtil.firstName(user.name);
    const lastName: string = StringUtil.lastName(user.name);

    await this._marketingService.registerOwnerReview({
      email: user.email,
      firstName,
      lastName,
      brand: vehicle.brandName,
      model: vehicle.modelName,
      plate: licensePlate,
    });
  }
}
