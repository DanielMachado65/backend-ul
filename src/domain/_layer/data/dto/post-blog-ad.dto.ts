export type PostBlogAdDto = {
  readonly thumbnailImageUrl: string;
  readonly title: string;
  readonly texts: ReadonlyArray<string>;
  readonly link: string;
};
