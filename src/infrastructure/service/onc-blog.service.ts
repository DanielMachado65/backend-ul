import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { convert } from 'html-to-text';
import { Observable, firstValueFrom } from 'rxjs';
import { PostBlogAdDto } from 'src/domain/_layer/data/dto/post-blog-ad.dto';
import { BlogService } from 'src/domain/_layer/infrastructure/service/blog.service';

type BlogData = {
  readonly _embedded: {
    readonly 'wp:featuredmedia': ReadonlyArray<{ readonly source_url: string }>;
  };
  readonly title: { readonly rendered: string };
  readonly content: { readonly rendered: string };
  readonly link: string;
};

type ResponseData = ReadonlyArray<BlogData>;

@Injectable()
export class OncBlogService implements BlogService {
  private readonly _convertConfig: Record<string, unknown> = {
    wordwrap: false,
    selectors: [
      {
        selector: 'a',
        format: 'anchor',
        options: { ignoreHref: true },
      },
    ],
  };

  constructor(private readonly _httpService: HttpService) {}

  async fetchPostData(url: string): Promise<PostBlogAdDto> {
    const slug: string = OncBlogService._extractSlug(url);
    const response$: Observable<AxiosResponse<ResponseData>> = this._httpService.get(
      `https://blog.olhonocarro.com.br/wp-json/wp/v2/posts?slug=${slug}&_embed`,
    );
    const response: AxiosResponse<ResponseData> = await firstValueFrom(response$);
    const data: BlogData = response.data[0];

    return {
      thumbnailImageUrl: data._embedded['wp:featuredmedia']['0'].source_url,
      title: convert(data.title.rendered, this._convertConfig),
      texts: convert(data.content.rendered, this._convertConfig)
        .split(/\n+/g)
        .slice(0, 3)
        .map((paragraph: string) => paragraph.trim()),
      link: url,
    };
  }

  private static _extractSlug(url: string): string {
    return url.match(/(?<=https?:\/\/www\.olhonocarro\.com\.br\/blog\/).+?(?=(\?|\/)|$)/)[0];
  }
}
