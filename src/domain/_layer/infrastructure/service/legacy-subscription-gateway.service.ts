export type ExternalLegacyGatewaySubscription = {
  id: string;
  cycled_at: string; // "2024-04-29"
};

export abstract class LegacySubscriptionGatewayService {
  abstract searchSubscription(externalId: string): Promise<ExternalLegacyGatewaySubscription>;
}
