import { randomUUID } from 'crypto';
import { EngageResult, GetReviewEngagementDomain } from 'src/domain/support/owner-review/get-review-engagement.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(GetReviewEngagementDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<GetReviewEngagementDomain> = TestSetup.run(GetReviewEngagementDomain);

  test('Get review engagement', async () => {
    /** - Setup - */
    const generatedReviewId: string = randomUUID();
    const generatedEngagement: EngageResult = {
      like: 10,
      dislike: 10,
    };

    jest
      .spyOn(setup.servicesMocks.ownerReviewService, 'getAnonymouslyEngagement')
      .mockImplementation(async (reviewId: string): Promise<EngageResult> => {
        if (generatedReviewId === reviewId) {
          return generatedEngagement;
        }
        throw Error('not found');
      });

    /** - Run - */
    const result: EngageResult = await setup.useCase.getAnonymouslyEngagement(generatedReviewId).unsafeRun();

    /** - Test - */
    expect(result).toBe(generatedEngagement);
  });
});
