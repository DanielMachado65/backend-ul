import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { VehicleVersionService, VersionAbout } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';
import { PassThrough, Readable } from 'stream';
import { FipeCodeObfuscatorUtil } from '../../../infrastructure/util/fipe-code-obfuscator.util';
import { PublicSiteStorage } from 'src/domain/_layer/infrastructure/service/public-site-storage.service';
import { SitemapStream } from 'sitemap';
import { ENV_KEYS, EnvService } from '../../../infrastructure/framework/env.service';
import { CronJob } from 'cron';

type Chunked<Type> = ReadonlyArray<ReadonlyArray<Type>>;

@Injectable()
export class SitemapJobUseCase implements OnApplicationBootstrap {
  constructor(
    private readonly _vehicleVersionService: VehicleVersionService,
    private readonly _fipeCodeObfuscatorUtil: FipeCodeObfuscatorUtil,
    private readonly _publicSiteStorage: PublicSiteStorage,
    private readonly _schedulerRegistry: SchedulerRegistry,
    private readonly _envService: EnvService,
  ) {}

  onApplicationBootstrap(): void {
    /** In case the cron hits while one of us is 'deving', especially without access to the versions API */
    if (this._envService.isProdEnv() || this._envService.get(ENV_KEYS.FORCE_ENABLE_SITEMAP) === 'true') {
      const job: CronJob = new CronJob('0 3 * * *', this.refreshSitemap.bind(this));
      this._schedulerRegistry.addCronJob('sitemap-refresh', job);
      job.start();

      if (this._envService.get(ENV_KEYS.FORCE_REFRESH_SITEMAP_BOOTSTRAP) === 'true') {
        void this.refreshSitemap().finally();
      }
    }
  }

  async refreshSitemap(): Promise<void> {
    // eslint-disable-next-line functional/prefer-readonly-type
    const allVehicles: Array<VersionAbout> =
      // eslint-disable-next-line functional/prefer-readonly-type
      (await this._vehicleVersionService.getAllPossibleVehicles()) as Array<VersionAbout>;
    const sortedAllVehicles: ReadonlyArray<VersionAbout> = allVehicles.sort(
      (a: VersionAbout, b: VersionAbout): number =>
        a.brandName.localeCompare(b.brandName) ||
        a.modelName.localeCompare(b.modelName) ||
        (a.modelYear === b.modelYear ? 0 : a.modelYear > b.modelYear ? 1 : -1) ||
        a.fipeCode.localeCompare(b.fipeCode),
    );
    const chunkedVehicles: Chunked<VersionAbout> = this._chunk(sortedAllVehicles, 45e3);

    /** Owner review */
    try {
      // eslint-disable-next-line prefer-const
      for (let chunkIndex in chunkedVehicles) {
        const stream: PassThrough = new PassThrough();
        const sendPromise: Promise<void> = this._publicSiteStorage.saveFile(
          `reviews-sitemap-${Number(chunkIndex) + 1}.xml`,
          'text/xml',
          stream,
        );

        const vehicles: ReadonlyArray<VersionAbout> = chunkedVehicles[chunkIndex];
        const links: ReadonlyArray<unknown> = this._mapLinks(vehicles, 'review');
        const sitemapStream: SitemapStream = new SitemapStream({ hostname: 'https://www.olhonocarro.com.br/' });

        Readable.from(links).pipe(sitemapStream).pipe(stream);
        await sendPromise;
      }
    } catch (error) {
      console.log(error);
      // skip
    }

    /** Datasheet */
    try {
      // eslint-disable-next-line prefer-const
      for (let chunkIndex in chunkedVehicles) {
        const stream: PassThrough = new PassThrough();
        const sendPromise: Promise<void> = this._publicSiteStorage.saveFile(
          `datasheet-sitemap-${Number(chunkIndex) + 1}.xml`,
          'text/xml',
          stream,
        );

        const vehicles: ReadonlyArray<VersionAbout> = chunkedVehicles[chunkIndex];
        const links: ReadonlyArray<unknown> = this._mapLinks(vehicles, 'datasheet');
        const sitemapStream: SitemapStream = new SitemapStream({ hostname: 'https://www.olhonocarro.com.br/' });

        Readable.from(links).pipe(sitemapStream).pipe(stream);
        await sendPromise;
      }
    } catch (error) {
      console.log(error);
      // skip
    }

    /** Partner review */
    try {
      // eslint-disable-next-line prefer-const
      for (let chunkIndex in chunkedVehicles) {
        const stream: PassThrough = new PassThrough();
        const sendPromise: Promise<void> = this._publicSiteStorage.saveFile(
          `partner-review-sitemap-${Number(chunkIndex) + 1}.xml`,
          'text/xml',
          stream,
        );

        const vehicles: ReadonlyArray<VersionAbout> = chunkedVehicles[chunkIndex];
        const links: ReadonlyArray<unknown> = this._mapLinks(vehicles, 'partner-review');
        const sitemapStream: SitemapStream = new SitemapStream({ hostname: 'https://www.olhonocarro.com.br/' });

        Readable.from(links).pipe(sitemapStream).pipe(stream);
        await sendPromise;
      }
    } catch (error) {
      console.log(error);
      // skip
    }
  }

  private _mapLinks(
    vehicles: ReadonlyArray<VersionAbout>,
    type: 'review' | 'datasheet' | 'partner-review',
  ): ReadonlyArray<unknown> {
    return vehicles.map((vehicle: VersionAbout): unknown => ({
      url: this._buildPathToOwnerReviewResultPage(
        vehicle.brandName,
        vehicle.modelName,
        vehicle.modelYear,
        vehicle.versionName,
        this._fipeCodeObfuscatorUtil.obfuscateFipeCode(vehicle.fipeCode.replace('-', '')),
        type,
      ),
      changefreq: 'weekly',
      priority: 0.7,
    }));
  }

  private _encode(thing: string | number): string {
    return encodeURIComponent(thing).replace(/\./g, '~');
  }

  private _buildPathToOwnerReviewResultPage(
    brandName: string,
    modelName: string,
    modelYear: string | number,
    versionName: string,
    versionCode: string,
    content: 'review' | 'datasheet' | 'partner-review' = 'review',
  ): string {
    return (
      '/catalogo/' +
      (content === 'review'
        ? 'resultado-opiniao/'
        : content === 'partner-review'
        ? 'resultado-review/'
        : 'resultado-ficha-tecnica/') +
      this._encode(brandName) +
      '_' +
      this._encode(modelName) +
      '_' +
      encodeURIComponent(modelYear) +
      '_' +
      this._encode(versionName) +
      '_' +
      encodeURIComponent(versionCode) +
      '/'
    );
  }

  _chunk<Type>(input: ReadonlyArray<Type>, size: number): Chunked<Type> {
    return input.reduce((arr: Chunked<Type>, item: Type, idx: number): Chunked<Type> => {
      return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
    }, []);
  }
}
