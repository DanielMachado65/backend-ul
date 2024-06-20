import { QueryComposerType } from 'src/domain/_entity/query-composer.entity';
import { QueryInfoAvailability } from 'src/domain/_entity/query-info.entity';
import { PriceTableProductDto } from 'src/domain/_layer/data/dto/price-table.dto';

export const mockPriceTableProductDto = (): PriceTableProductDto => ({
  name: 'any_name',
  buyable: true,
  code: Math.random() * 100,
  exampleQuery: 'any_example_query',
  faq: [{ title: 'any_title_1', answer: 'any_answer_1' }],
  fullDescription: 'any_description',
  isRecommended: true,
  marketingPrice: 19.0,
  queryInfos: [
    {
      description: 'any_query_info_description',
      image: 'any_query_info_image',
      isAvailable: QueryInfoAvailability.ALWAYS,
      isAvailableToOthers: QueryInfoAvailability.ALWAYS,
      name: 'any_query_info_name',
    },
  ],
  shortDescription: 'any_short_description',
  showInComparisonTable: true,
  testimonials: [{ authorName: 'any_author_name_1', content: 'any_content_1', userId: 'any_user_id' }],
  totalPrice: 18.0,
  type: QueryComposerType.VEHICULAR,
});
