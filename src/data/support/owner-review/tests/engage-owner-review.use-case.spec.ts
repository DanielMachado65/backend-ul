import { randomUUID } from 'crypto';
import { EngageOwnerReviewDomain, EngageResult } from 'src/domain/support/owner-review/engage-owner-review.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

export type EngageResultStore = {
  // eslint-disable-next-line functional/prefer-readonly-type
  like: number;
  // eslint-disable-next-line functional/prefer-readonly-type
  dislike: number;
};

function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe(EngageOwnerReviewDomain.name, () => {
  /** - Setup - */
  const generatedReviewId: string = randomUUID();
  const toLike: number = getRandomInteger(1, 15);
  const toDislike: number = getRandomInteger(1, 15);
  const engagement: EngageResultStore = {
    like: getRandomInteger(1, 100),
    dislike: getRandomInteger(1, 100),
  };
  const setup: TestSetup<EngageOwnerReviewDomain> = TestSetup.run(EngageOwnerReviewDomain);

  async function like(): Promise<void> {
    /** - Setup - */
    const beforeLike: number = engagement.like;

    /** - Run - */
    const result: EngageResult = await setup.useCase.anonymouslyEngage(generatedReviewId, 'like').unsafeRun();

    /** - Test - */
    expect(beforeLike + 1).toBe(result.like);
  }

  async function dislike(): Promise<void> {
    /** - Setup - */
    const beforeDislike: number = engagement.dislike;

    /** - Run - */
    const result: EngageResult = await setup.useCase.anonymouslyEngage(generatedReviewId, 'dislike').unsafeRun();

    /** - Test - */
    expect(beforeDislike + 1).toBe(result.dislike);
  }

  beforeEach(() => {
    jest
      .spyOn(setup.servicesMocks.ownerReviewService, 'anonymouslyEngage')
      .mockImplementation(async (reviewId: string, reaction: 'like' | 'dislike'): Promise<EngageResult> => {
        if (reviewId === generatedReviewId) {
          // eslint-disable-next-line functional/immutable-data
          engagement[reaction] += 1;

          return {
            like: engagement.like,
            dislike: engagement.dislike,
          };
        }

        throw Error('not found');
      });
  });

  test('Like a owner review', async () => {
    const engagementBeforeTest: EngageResultStore = { ...engagement };

    for (let i: number = 1; i <= toLike; i++) {
      await like();
    }

    expect(engagementBeforeTest.like + toLike).toBe(engagement.like);
  });

  test('Dislike a owner review', async () => {
    const engagementBeforeTest: EngageResultStore = { ...engagement };

    for (let i: number = 1; i <= toDislike; i++) {
      await dislike();
    }

    expect(engagementBeforeTest.dislike + toDislike).toBe(engagement.dislike);
  });
});
