export class QueryBlogPostVo {
  blogUrl: string;
}

export class QueryVideoPostVo {
  videoUrl: string;
}

export type QueryReviewVo = {
  readonly codigoMarcaModelo: number;
  readonly anoModelo: number;
  readonly blogPosts: ReadonlyArray<QueryBlogPostVo>;
  readonly videoPosts: ReadonlyArray<QueryVideoPostVo>;
};
