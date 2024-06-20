import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GetTestDriveDomain, GetTestDriveIO } from 'src/domain/core/query/get-test-drive.domain';
import { QueryNotExistsError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { TestDriveResponse, TestDriveResponseJson } from 'src/domain/_entity/test-drive-query.entity';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { TestDriveQueryRepository } from 'src/domain/_layer/infrastructure/repository/test-drive-query.repository';
import { StringUtil } from 'src/infrastructure/util/string.util';
import { EmbedInfo, VideoPlatformService } from 'src/domain/_layer/infrastructure/service/video-platform.service';
import { BlogService } from 'src/domain/_layer/infrastructure/service/blog.service';
import { BlogPostEntity, VideoPostEntity } from 'src/domain/_entity/vehicle-review.entity';
import { PostBlogAdDto } from 'src/domain/_layer/data/dto/post-blog-ad.dto';
import { VideoPostResponseEntity } from 'src/domain/_entity/vehicle-youtube-review.entity';
import { BlogPostResponseEntity } from 'src/domain/_entity/vehicle-blog-review.entity';

@Injectable()
export class GetTestDriveUseCase implements GetTestDriveDomain {
  private readonly _blogAbout: ReadonlyArray<string> = [
    'Nessa área da consulta você pode acessar o texto completo de avaliação do modelo (quando disponível) para saber informações sobre evolução, mudanças e novidades, além dos pontos fortes e fracos do carro ou da moto que você consultou.',
    'Assim você não precisa perder tempo revirando a internet em busca de mais informações sobre o modelo consultado.',
  ];
  private readonly _youtubeAbout: ReadonlyArray<string> = [
    'Nessa área da consulta você pode assistir ao vídeo de avaliação do modelo (quando disponível) para saber informações sobre evolução, mudanças e novidades, além dos pontos fortes e fracos do carro ou da moto que você consultou. Tudo isso de um jeito rápido e fácil de entender.',
    'Assim você não precisa perder tempo revirando a internet em busca de mais informações sobre o modelo consultado.',
  ];
  private readonly _urlDescription: string =
    'https://www.olhonocarro.com.br/blog/entendendo-a-consulta-da-olho-no-carro-review-blog-e-review-dos-nossos-parceiros';
  private readonly _bgColor: string = 'success';

  constructor(
    private readonly _testDriveQueryRepository: TestDriveQueryRepository,
    private readonly _videoPlatformService: VideoPlatformService,
    private readonly _blogService: BlogService,
  ) {}

  getTestDrive(queryId: string): GetTestDriveIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._testDriveQueryRepository.getById(queryId))
      .filter(QueryNotExistsError.toFn(), (testDriveDto: TestDriveQueryDto) => !!testDriveDto)
      .map(async ({ responseJson, ...rest }: TestDriveQueryDto) => {
        if (responseJson !== null && responseJson !== undefined) {
          const { chassi, renavam, dadosBasicos, avaliacaoVeicular, ...jsonRest }: TestDriveResponseJson = responseJson;
          const hiddenChassis: string = StringUtil.hideValue(chassi, 4);
          const hiddenRenavam: string = StringUtil.hideValue(renavam, 4);
          const blogs: ReadonlyArray<BlogPostEntity> = avaliacaoVeicular && avaliacaoVeicular.blogPosts;
          const videos: ReadonlyArray<VideoPostEntity> = avaliacaoVeicular && avaliacaoVeicular.videoPosts;

          return {
            responseJson: {
              ...jsonRest,
              chassi: hiddenChassis,
              renavam: hiddenRenavam,
              dadosBasicos: {
                ...dadosBasicos,
                chassi: hiddenChassis,
                renavam: hiddenRenavam,
              },
              ...(await this._getBlogPosts(blogs)),
              ...(await this._getVideoPosts(videos)),
            },
            ...rest,
          };
        }
        return {
          responseJson: null,
          ...rest,
        };
      });
  }

  private async _getBlogPosts(blogs: ReadonlyArray<BlogPostEntity>): Promise<Pick<TestDriveResponse, 'avaliacaoBlog'>> {
    const blogData: ReadonlyArray<BlogPostEntity> = blogs || [];
    const postsAdData: ReadonlyArray<PostBlogAdDto> = await Promise.all(
      blogData.map((blogPost: BlogPostEntity) => this._blogService.fetchPostData(blogPost.blogUrl).catch(() => null)),
    );

    const blogPosts: ReadonlyArray<BlogPostResponseEntity> = postsAdData.filter(Boolean);

    return blogPosts.length <= 0
      ? null
      : {
          avaliacaoBlog: {
            blogPosts: blogPosts,
            saibaMais: this._blogAbout,
            urlDescription: this._urlDescription,
            bgColor: this._bgColor,
          },
        };
  }

  private async _getVideoPosts(
    videos: ReadonlyArray<VideoPostEntity>,
  ): Promise<Pick<TestDriveResponse, 'avaliacaoYoutube'>> {
    const videosData: ReadonlyArray<VideoPostEntity> = videos || [];
    const videosInfoData: ReadonlyArray<EmbedInfo | null> = await Promise.all(
      videosData.map((videoPost: VideoPostEntity) =>
        this._videoPlatformService.getEmbedInfo(videoPost.videoUrl).catch(() => null),
      ),
    );

    const videoPosts: ReadonlyArray<VideoPostResponseEntity> = videosInfoData
      .filter(Boolean)
      .map((embedInfo: EmbedInfo) => ({
        embedUrl: embedInfo.embedUrl,
        title: embedInfo.title,
      }));

    return videoPosts.length <= 0
      ? null
      : {
          avaliacaoYoutube: {
            videoPosts: videoPosts,
            saibaMais: this._youtubeAbout,
            urlDescription: this._urlDescription,
            bgColor: this._bgColor,
          },
        };
  }
}
