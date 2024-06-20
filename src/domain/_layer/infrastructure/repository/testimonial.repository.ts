import { TestimonialDto, TestimonialEssentialsDto } from '../../data/dto/testimonial.dto';
import { IBaseRepository } from './base.repository';

export abstract class TestimonialRepository<TransactionReference = unknown>
  implements IBaseRepository<TestimonialDto, TransactionReference>
{
  abstract getById(id: string): Promise<TestimonialDto | null>;

  abstract insert(
    inputDto: Partial<TestimonialDto>,
    transactionReference?: TransactionReference,
  ): Promise<TestimonialDto>;

  abstract insertMany(
    inputs: ReadonlyArray<Partial<TestimonialDto>>,
    transactionReference: TransactionReference | undefined,
  ): Promise<ReadonlyArray<TestimonialDto>>;

  abstract removeById(id: string, transactionReference?: TransactionReference): Promise<TestimonialDto | null>;

  abstract updateById(
    id: string,
    updateDto: Partial<TestimonialDto>,
    transactionReference?: TransactionReference,
  ): Promise<TestimonialDto | null>;

  abstract count(): Promise<number>;

  abstract getAllTestimonials(): Promise<ReadonlyArray<TestimonialEssentialsDto>>;
}
