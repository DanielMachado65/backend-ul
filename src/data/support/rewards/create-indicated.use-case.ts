import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { IndicatedNotProcessDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { IndicatedDto } from 'src/domain/_layer/data/dto/indicated.dto';
import { IndicateAndEarnService } from 'src/domain/_layer/infrastructure/service/indicate-and-earn.service';
import { IndicatedInputDto } from 'src/domain/_layer/presentation/dto/indicated-input.dto';
import { CreateIndicatedDomain, CreateIndicateIO } from 'src/domain/support/rewards/create-indicated.domain';

@Injectable()
export class CreateIndicatedUseCase implements CreateIndicatedDomain {
  constructor(private readonly _indicateApiService: IndicateAndEarnService) {}

  create({ email, participantId }: IndicatedInputDto): CreateIndicateIO {
    return EitherIO.from(UnknownDomainError.toFn(), this._createIndicated(email, participantId)).filter(
      IndicatedNotProcessDomainError.toFn(),
      (response: IndicatedDto) => !!response,
    );
  }

  private _createIndicated(email: string, participantId: string) {
    return async (): Promise<IndicatedDto> => {
      return await this._indicateApiService.addIndicated({
        email,
        participantId,
      });
    };
  }
}
