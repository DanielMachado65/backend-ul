import { QueryReviewVo } from 'src/domain/value-object/query/query-review.vo';
import { BlogPostVo, VehicleReviewVo, VideoPostVo } from 'src/domain/value-object/vehicle-review.vo';

export class VehicleReviewParser {
  static parse(review: VehicleReviewVo): QueryReviewVo {
    return (
      review && {
        codigoMarcaModelo: review?.modelBrandCode,
        anoModelo: review?.modelYear,
        blogPosts: review?.blogPosts?.map((blogPost: BlogPostVo) => ({
          blogUrl: blogPost?.blogUrl,
        })),
        videoPosts: review?.videoPosts?.map((videoPost: VideoPostVo) => ({
          videoUrl: videoPost?.videoUrl,
        })),
      }
    );
  }
}
