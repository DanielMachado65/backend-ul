import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from '../../../domain/_entity/result.error';
import { TestDriveQueryRepository } from '../../../domain/_layer/infrastructure/repository/test-drive-query.repository';
import { PeopleImpactedDomain, PeopleImpactedIO } from '../../../domain/support/marketing/people-impacted.domain';

@Injectable()
export class PeopleImpactedUseCase implements PeopleImpactedDomain {
  constructor(private readonly _testDriveQueryRepository: TestDriveQueryRepository) {}

  private static _calculatePeopleImpacted(testDriveCount: number): number {
    // Yago defined this number
    const magicNumber: number = 2;
    return Math.round(testDriveCount / magicNumber);
  }

  private static _calculateAverageScore(): number {
    // Google's current score (we need to get this from API later)
    return 4.8;
  }

  getPeopleImpacted(): PeopleImpactedIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._testDriveQueryRepository.count())
      .map((testDriveCount: number) => PeopleImpactedUseCase._calculatePeopleImpacted(testDriveCount))
      .map((peopleImpacted: number) => ({
        averageScore: PeopleImpactedUseCase._calculateAverageScore(),
        peopleCount: peopleImpacted,
      }));
  }
}
