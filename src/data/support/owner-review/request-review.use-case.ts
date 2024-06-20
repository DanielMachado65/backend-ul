import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { FullPaginatedReviewsDto } from 'src/domain/_layer/data/dto/owner-review.dto';
import {
  OwnerReviewModel,
  OwnerReviewModelRepository,
} from 'src/domain/_layer/infrastructure/repository/owner-review-model.repository';
import { AutomateEnum, AutomateService } from 'src/domain/_layer/infrastructure/service/automate.service';
import { OwnerReviewService } from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { VehicleVersionService, VersionAbout } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';
import { RequestReviewDomain, RequestReviewIO } from 'src/domain/support/owner-review/request-review.domain';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { FipeCodeObfuscatorUtil } from 'src/infrastructure/util/fipe-code-obfuscator.util';

@Injectable()
export class RequestReviewUseCase implements RequestReviewDomain {
  constructor(
    private readonly _ownerReviewModelRepository: OwnerReviewModelRepository,
    private readonly _automateService: AutomateService,
    private readonly _vehicleVersionService: VehicleVersionService,
    private readonly _ownerReviewService: OwnerReviewService,
    private readonly _fipeCodeObfuscatorUtil: FipeCodeObfuscatorUtil,
    private readonly _envService: EnvService,
  ) {}

  requestReview(email: string, fipeId: string, modelYear: number): RequestReviewIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      const ownerReview: OwnerReviewModel = await this._ownerReviewModelRepository.getModel(fipeId, modelYear);
      const about: VersionAbout = await this._vehicleVersionService.getVersionAbout(fipeId, modelYear);
      const page: FullPaginatedReviewsDto = await this._ownerReviewService.listPaginatedByVersion({
        fipeId,
        page: 1,
        perPage: 0,
      });

      await this._automateService.dispatch(AutomateEnum.REVIEW, {
        email,
        fipeId,
        modelYear,
        brandName: about.brandName,
        modelName: about.modelName,
        versionName: about.versionName,
        totalOwnerReviews: page.count,
        hasDatasheet:
          typeof ownerReview?.vehicle.datasheet?.length === 'number' && ownerReview?.vehicle.datasheet?.length > 0,
        url:
          this._envService.get('WEB_SITE_BASE_URL') +
          this._buildPathToOwnerReviewResultPage(
            about.brandName,
            about.modelName,
            about.modelYear,
            about.versionName,
            this._fipeCodeObfuscatorUtil.obfuscateFipeCode(fipeId),
            'review',
          ),
      });
    });
  }

  private _buildPathToOwnerReviewResultPage(
    brandName: string,
    modelName: string,
    modelYear: string | number,
    versionName: string,
    versionCode: string,
    content: 'review' | 'datasheet' = 'review',
  ): string {
    return (
      '/catalogo/' +
      (content === 'review' ? 'resultado-opiniao/' : 'resultado-ficha-tecnica/') +
      this._encode(brandName) +
      '_' +
      this._encode(modelName) +
      '_' +
      encodeURIComponent(modelYear) +
      '_' +
      this._encode(versionName) +
      '_' +
      encodeURIComponent(versionCode) +
      '/'
    );
  }

  private _encode(thing: string | number): string {
    return encodeURIComponent(thing).replace(/\./g, '~');
  }
}
