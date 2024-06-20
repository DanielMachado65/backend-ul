import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { FaqEssentialsEntity } from 'src/domain/_entity/faq.entity';
import { FaqEssentialsDto } from '../../data/dto/faq.dto';

export class AllFaqOutputDto {
  @IsArray({ each: true })
  @Type(() => FaqEssentialsEntity)
  @ApiProperty({ type: [FaqEssentialsEntity] })
  frequentlyAskedQuestions: ReadonlyArray<FaqEssentialsDto>;
}
