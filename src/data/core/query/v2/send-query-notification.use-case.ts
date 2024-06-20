import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { QueryFailedService, QueryStatus } from 'src/domain/_entity/query.entity';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { BlogPostResponseEntity } from 'src/domain/_entity/vehicle-blog-review.entity';
import { BlogPostEntity, VideoPostEntity } from 'src/domain/_entity/vehicle-review.entity';
import { VideoPostResponseEntity } from 'src/domain/_entity/vehicle-youtube-review.entity';
import { PostBlogAdDto } from 'src/domain/_layer/data/dto/post-blog-ad.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';
import {
  NotificationIdentifier,
  NotificationQueryCompletePayload,
} from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { BlogService } from 'src/domain/_layer/infrastructure/service/blog.service';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import { EmbedInfo, VideoPlatformService } from 'src/domain/_layer/infrastructure/service/video-platform.service';
import { WebhookService } from 'src/domain/_layer/infrastructure/service/webhook.service';
import {
  SendQueryNotificationDomain,
  SendQueryNotificationIO,
} from 'src/domain/core/query/v2/send-query-response-integrator.domain';
import { QueryReviewVo } from 'src/domain/value-object/query/query-review.vo';
import { BlogPostVo, VideoPostVo } from 'src/domain/value-object/vehicle-review.vo';

@Injectable()
export class SendQueryNotificationUseCase implements SendQueryNotificationDomain {
  private static readonly MINUTES_DELAY: number = 5 * 60 * 1000;

  constructor(
    private readonly _webhookService: WebhookService,
    private readonly _userRepository: UserRepository,
    private readonly _notificationInfraService: NotificationInfrastructure,
    private readonly _notificationEmailService: NotificationServiceGen,
    private readonly _queryJob: QueryJob,
    private readonly _videoPlatformService: VideoPlatformService,
    private readonly _blogService: BlogService,
  ) {}

  execute(queryDto: QueryDto): SendQueryNotificationIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(queryDto.userId))
      .tap(async (user: UserDto) => {
        if (user.webhookUrls.length > 0) {
          const query: Partial<QueryDto> = this._parseWebhookResponseData(queryDto);
          return await this._webhookService.sendMany(user.webhookUrls, query);
        }

        if (queryDto.queryStatus === QueryStatus.FAILURE) {
          return this._sendNotificationOnQueryFail(queryDto);
        }

        return await this._sendNotificationOnSuccess(queryDto);
      })
      .map(() => null);
  }

  private async _sendNotificationOnSuccess(queryDto: QueryDto): Promise<void> {
    const queryData: NotificationQueryCompletePayload = {
      queryId: queryDto.id,
      queryCode: queryDto.queryCode,
      documentType: queryDto.documentType,
      documentQuery: queryDto.documentQuery,
      queryName: queryDto.refClass,
    };

    this._notificationInfraService.dispatch(
      NotificationIdentifier.QUERY_SUCCESS,
      [{ subscriberId: queryDto.userId }],
      queryData,
    );

    const delay: number = SendQueryNotificationUseCase.MINUTES_DELAY;

    await this._queryJob.createJob(queryDto.id, queryData, { delay, removeOnComplete: true });
  }

  private async _sendNotificationOnQueryFail(queryDto: QueryDto): Promise<void> {
    const userDto: UserDto = await this._userRepository.getById(queryDto.userId);
    const userFirstName: string = userDto.name.split(' ')[0];

    await this._notificationEmailService.dispatch(NotificationTransport.EMAIL, NotificationType.QUERY_FAIL, {
      email: userDto.email,
      name: userFirstName,
      queryName: queryDto.refClass,
    });
  }

  private _hideFields(failedServices: ReadonlyArray<QueryFailedService>): ReadonlyArray<Partial<QueryFailedService>> {
    return failedServices.map((e: QueryFailedService) => ({
      serviceCode: e.serviceCode,
      serviceName: e.serviceName,
    }));
  }

  private _parseWebhookResponseData(queryDto: QueryDto): Partial<QueryDto> {
    const avaliacaoVeicular: QueryReviewVo =
      queryDto.responseJson && (queryDto.responseJson.avaliacaoVeicular as QueryReviewVo);

    return {
      id: queryDto.id,
      userId: queryDto.userId,
      queryKeys: queryDto.queryKeys,
      queryCode: queryDto.queryCode,
      documentType: queryDto.documentType,
      documentQuery: queryDto.documentQuery,
      queryStatus: queryDto.queryStatus,
      refClass: queryDto.refClass,
      responseJson: {
        ...queryDto.responseJson,
        avaliacaoVeicular: avaliacaoVeicular && {
          videoPosts: this._getVideoPosts(avaliacaoVeicular.videoPosts),
          blogPosts: this._getBlogPosts(avaliacaoVeicular.blogPosts),
        },
      },
      version: queryDto.version,
      executionTime: queryDto.executionTime,
      failedServices: this._hideFields(queryDto.failedServices) as ReadonlyArray<QueryFailedService>,
      createdAt: queryDto.createdAt,
    };
  }

  private async _getBlogPosts(blogs: ReadonlyArray<BlogPostVo>): Promise<ReadonlyArray<BlogPostResponseEntity>> {
    const blogData: ReadonlyArray<BlogPostEntity> = blogs || [];
    const postsAdData: ReadonlyArray<PostBlogAdDto> = await Promise.all(
      blogData.map((blogPost: BlogPostEntity) => this._blogService.fetchPostData(blogPost.blogUrl).catch(() => null)),
    );

    return postsAdData.filter(Boolean);
  }

  private async _getVideoPosts(videos: ReadonlyArray<VideoPostVo>): Promise<ReadonlyArray<VideoPostResponseEntity>> {
    const videosData: ReadonlyArray<VideoPostEntity> = videos || [];
    const videosInfoData: ReadonlyArray<EmbedInfo | null> = await Promise.all(
      videosData.map((videoPost: VideoPostEntity) =>
        this._videoPlatformService.getEmbedInfo(videoPost.videoUrl).catch(() => null),
      ),
    );

    return videosInfoData.filter(Boolean).map((embedInfo: EmbedInfo) => ({
      embedUrl: embedInfo.embedUrl,
      title: embedInfo.title,
    }));
  }
}
