import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { FullPaginatedReviewsDto, OwnerReviewFullDto, RankingDto } from 'src/domain/_layer/data/dto/owner-review.dto';
import {
  OwnerReviewService,
  ReviewListOrderBy,
  ReviewListSortBy,
} from 'src/domain/_layer/infrastructure/service/owner-review.service';
import { MyCarQueryOwnerReview } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryOwnerReviewDomain, QueryOwnerReviewIO } from 'src/domain/core/product/query-owner-review.domain';
import { MyCarsQueryHelper } from './my-cars-query.helper';

type Rank = { readonly property: string; readonly rank: number };

type ReviewsResponse = {
  readonly generalReview: RankingDto;
  readonly paginatedReviews: FullPaginatedReviewsDto;
};

@Injectable()
export class QueryOwnerReviewUseCase implements QueryOwnerReviewDomain {
  private static readonly TEMPLATE_QUERY: string = '3';

  constructor(private readonly _helper: MyCarsQueryHelper, private readonly _ownerService: OwnerReviewService) {}

  execute(userId: string, carId: string): QueryOwnerReviewIO {
    return this._helper
      .getCar(userId, carId)
      .map(this._processQuery())
      .filter(ProviderUnavailableDomainError.toFn(), this._isValidQuery())
      .map(this._parseResponse());
  }

  private _processQuery(): (carDto: MyCarProductWithUserDto) => Promise<ReviewsResponse> {
    return async (carDto: MyCarProductWithUserDto) => {
      const fipeId: string = carDto.keys.fipeId || null;
      const modelYear: number = carDto.keys.modelYear || -1;
      const generalReview: RankingDto = await this._ownerService.getReviewByFipeId(fipeId);
      const paginatedReviews: FullPaginatedReviewsDto = await this._ownerService.listPaginatedByVersion({
        fipeId,
        modelYear,
        page: 1,
        perPage: 10,
        sortBy: ReviewListSortBy.DATE,
        orderBy: ReviewListOrderBy.DESC,
      });

      return { generalReview, paginatedReviews };
    };
  }

  private _isValidQuery(): (dto: ReviewsResponse) => boolean {
    return ({ generalReview, paginatedReviews }: ReviewsResponse) => !!generalReview && !!paginatedReviews;
  }

  private _parseResponse() {
    return ({ generalReview, paginatedReviews }: ReviewsResponse): MyCarQueryOwnerReview => {
      const reviews: ReadonlyArray<OwnerReviewFullDto> = Array.isArray(paginatedReviews.items)
        ? paginatedReviews.items
        : [];

      return {
        rankingAverage: {
          totalScore: generalReview.totalScore,
          fields: this._rankingParser(generalReview),
        },
        reviews: reviews.map((review: OwnerReviewFullDto) => ({
          cons: review.cons,
          flaws: review.flaws,
          generalFeedback: review.generalFeedback,
          km: review.km,
          name: review.owner?.name || '-',
          ranking: {
            fields: this._rankingParser(review.ranking),
            totalScore: review.ranking?.totalScore || 0,
          },
          reviewAt: review.createdAt,
          strengths: review.strengths,
        })),
      };
    };
  }

  private _rankingParser(ranking: RankingDto): ReadonlyArray<Rank> {
    return [
      { property: 'Acabamento e Conforto', rank: ranking.comfort },
      { property: 'Câmbio', rank: ranking.cambium },
      { property: 'Consumo na cidade', rank: ranking.cityConsumption },
      { property: 'Consumo na estrada', rank: ranking.roadConsumption },
      { property: 'Desempenho', rank: ranking.performance },
      { property: 'Dirigibilidade', rank: ranking.drivability },
      { property: 'Espaço interno', rank: ranking.internalSpace },
      { property: 'Estabilidade', rank: ranking.stability },
      { property: 'Freios', rank: ranking.brakes },
      { property: 'Porta-malas', rank: ranking.trunk },
      { property: 'Suspensão', rank: ranking.suspension },
      { property: 'Custo-benefício', rank: ranking.costBenefit },
    ].filter((item: { readonly rank: number }) => typeof item.rank === 'number');
  }
}
