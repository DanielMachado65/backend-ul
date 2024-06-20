import { TestimonialEntity, TestimonialEssentialsEntity } from 'src/domain/_entity/testimonial.entity';

export type TestimonialDto = TestimonialEntity;

export type TestimonialEssentialsDto = TestimonialEssentialsEntity;

export type TestimonialWithoutTimestampsDto = Omit<TestimonialDto, 'deletedAt' | 'updatedAt' | 'createdAt'>;
