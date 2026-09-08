import { describe, it, expect } from "vitest";
import { marketplaceStore } from "../lib/store/mockStore";

describe("Atomic Bid Acceptance & Award Transaction", () => {
  const reqId = "77777777-7777-7777-7777-777777777701";
  const bidId = "99999999-9999-9999-9999-999999999901";
  const buyerOrgId = "44444444-4444-4444-4444-444444444401";
  const vendor1OrgId = "44444444-4444-4444-4444-444444444402";

  it("Accepting a bid atomically updates requirement to awarded and bid to accepted", () => {
    marketplaceStore.setSession("33333333-3333-3333-3333-333333333301", buyerOrgId);

    const result = marketplaceStore.acceptBid(bidId);
    expect(result.success).toBe(true);
    expect(result.bid.status).toBe("accepted");
    expect(result.requirement.status).toBe("awarded");

    // Check contact unmasking is now active between buyer and winning vendor
    const contact = marketplaceStore.getContactForOrg(vendor1OrgId, buyerOrgId);
    expect(contact.isMasked).toBe(false);
    expect(contact.email).toBe("sales@precisiontech.in");
  });
});
