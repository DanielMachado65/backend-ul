export type BrandImage = {
  readonly mainImageUrl: string | null;
};

export type ModelImage = {
  readonly realImagesUrl: ReadonlyArray<string>;
};

export type FallbackImageConfiguration = { readonly mainFallbackUrl: string };

export abstract class VehicleImageService {
  abstract getImageForModelCode(brandCode: string): Promise<ModelImage>;

  abstract getImageForBrandName(
    brandName: string,
    options?: { readonly fallbackNotFoundToDefaultImage?: boolean },
  ): Promise<BrandImage>;
}
