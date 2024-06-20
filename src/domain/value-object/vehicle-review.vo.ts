export class BlogPostVo {
  blogUrl: string;
}

export class VideoPostVo {
  videoUrl: string;
}

export class VehicleReviewVo {
  modelBrandCode: number;
  modelYear: number;
  blogPosts: Array<BlogPostVo>;
  videoPosts: Array<VideoPostVo>;
}
