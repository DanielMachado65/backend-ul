import { PostBlogAdDto } from '../../data/dto/post-blog-ad.dto';

export abstract class BlogService {
  abstract fetchPostData(url: string): Promise<PostBlogAdDto>;
}
