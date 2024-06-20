import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type SendAlertFipePriceError = UnknownDomainError;

export type SendAlertFipePriceIO = EitherIO<SendAlertFipePriceError, boolean>;

export type FipePriceWithMyCar = {
  readonly currentPrice: string;
  readonly oldPrice: string;
  readonly variationPercent: string;
};

export abstract class SendAlertFipePriceDomain {
  abstract execute(): SendAlertFipePriceIO;
}
