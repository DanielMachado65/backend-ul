import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TrackPaymentInitPayloadDto } from 'src/domain/_layer/data/dto/track-payment-init-payload.dto';

export type TrackCheckoutInitDomainErrors = UnknownDomainError;

export type TrackCheckoutInitResult = Either<TrackCheckoutInitDomainErrors, void>;

export type TrackCheckoutInitIO = EitherIO<TrackCheckoutInitDomainErrors, void>;

export abstract class TrackCheckoutInitDomain {
  abstract track(userId: string, input: TrackPaymentInitPayloadDto): TrackCheckoutInitIO;
}
