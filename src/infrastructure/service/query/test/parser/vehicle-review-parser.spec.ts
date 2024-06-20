import { QueryReviewVo } from 'src/domain/value-object/query/query-review.vo';
import { BlogPostVo, VehicleReviewVo, VideoPostVo } from 'src/domain/value-object/vehicle-review.vo';
import { VehicleReviewParser } from 'src/infrastructure/service/query/parser/vehicle-review-parser';

const mockVehicleReviewVo = (): VehicleReviewVo => ({
  blogPosts: [{ blogUrl: 'any_blog_url' }],
  modelBrandCode: 23132,
  modelYear: 2023,
  videoPosts: [{ videoUrl: 'any_video_url' }],
});

describe(VehicleReviewParser.name, () => {
  test('should return null if review is null or undefined', () => {
    const result: QueryReviewVo = VehicleReviewParser.parse(null);
    expect(result).toBe(null);

    const result2: QueryReviewVo = VehicleReviewParser.parse(undefined);
    expect(result2).toBe(undefined);
  });

  test('should parse to QueryReviewVo', () => {
    const input: VehicleReviewVo = mockVehicleReviewVo();

    const result: QueryReviewVo = VehicleReviewParser.parse(input);

    expect(result).toStrictEqual({
      codigoMarcaModelo: input.modelBrandCode,
      anoModelo: input.modelYear,
      blogPosts: input.blogPosts?.map((blogPost: BlogPostVo) => ({
        blogUrl: blogPost?.blogUrl,
      })),
      videoPosts: input.videoPosts?.map((videoPost: VideoPostVo) => ({
        videoUrl: videoPost?.videoUrl,
      })),
    });
  });
});
