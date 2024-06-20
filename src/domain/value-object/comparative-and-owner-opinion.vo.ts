import { ComparativeVo } from 'src/domain/value-object/comparative.vo';
import { OwnerOpinionVo } from 'src/domain/value-object/owner-opinion.vo';

export type ComparativeAndOwnerOpinionVo = {
  readonly comparative: ReadonlyArray<ComparativeVo>;
  readonly ownerOpinion: ReadonlyArray<OwnerOpinionVo>;
};
