import { Injectable } from '@nestjs/common';
import { PostBlogAdDto } from 'src/domain/_layer/data/dto/post-blog-ad.dto';
import { BlogService } from 'src/domain/_layer/infrastructure/service/blog.service';

@Injectable()
export class BlogMockService implements BlogService {
  fetchPostData(_url: string): Promise<PostBlogAdDto> {
    throw new Error('Method not implemented.');
  }
}
