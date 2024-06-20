import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { QueryComposeStatus } from 'src/domain/_entity/query-composer.entity';
import { GetQueryComposerDomain, GetQueryComposerIO } from '../../../domain/core/query/get-query-composer.domain';
import { QueryPriceTableTemplateItem } from '../../../domain/_entity/query-price-table.entity';
import {
  NoProductFoundDomainError,
  NoQueryFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { PriceTableDto } from '../../../domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from '../../../domain/_layer/data/dto/query-composer.dto';
import { PriceTableRepository } from '../../../domain/_layer/infrastructure/repository/price-table.repository';
import { QueryComposerRepository } from '../../../domain/_layer/infrastructure/repository/query-composer.repository';

type GetUserComposerFromPriceTableIO = EitherIO<UnknownDomainError | NoUserFoundDomainError, PriceTableDto>;

type ComposerAvailabilityData = {
  readonly priceTableDto: PriceTableDto;
  readonly queryComposerDto: QueryComposerDto;
};

@Injectable()
export class GetQueryComposerUseCase implements GetQueryComposerDomain {
  constructor(
    private readonly _priceTableRepository: PriceTableRepository,
    private readonly _queryComposerRepository: QueryComposerRepository,
  ) {}

  private _getQueryComposersFromUserPriceTable(userId: string): GetUserComposerFromPriceTableIO {
    return EitherIO.of(UnknownDomainError.toFn(), userId)
      .map((id: string) => this._priceTableRepository.getUserPriceTable(id))
      .filter(NoUserFoundDomainError.toFn(), (priceTableDto: PriceTableDto) => priceTableDto.template.length > 0);
  }

  private _getQueryComposerFromQueryCode(queryCode: number): GetQueryComposerIO {
    return EitherIO.of(UnknownDomainError.toFn(), queryCode)
      .map((code: number) => this._queryComposerRepository.getByQueryCode(code))
      .filter(NoProductFoundDomainError.toFn(), (queryComposerDto: QueryComposerDto) => !!queryComposerDto);
  }

  getQueryComposer(userId: string, queryCode: number): GetQueryComposerIO {
    return this._getQueryComposersFromUserPriceTable(userId)
      .zip(
        this._getQueryComposerFromQueryCode(queryCode),
        (priceTableDto: PriceTableDto, queryComposerDto: QueryComposerDto) => ({ priceTableDto, queryComposerDto }),
      )
      .filter(NoProductFoundDomainError.toFn(), ({ priceTableDto, queryComposerDto }: ComposerAvailabilityData) =>
        priceTableDto.template.some(
          (template: QueryPriceTableTemplateItem) => template.queryCode === queryComposerDto.queryCode,
        ),
      )
      .filter(
        NoQueryFoundDomainError.toFn(),
        ({ queryComposerDto }: ComposerAvailabilityData) => queryComposerDto.status === QueryComposeStatus.ACTIVATED,
      )
      .map(({ queryComposerDto }: ComposerAvailabilityData) => queryComposerDto);
  }
}
