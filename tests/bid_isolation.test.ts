import { describe, it, expect, beforeEach } from "vitest";
import { marketplaceStore } from "../lib/store/mockStore";

describe("Strict Bid Isolation Security", () => {
  const reqId = "77777777-7777-7777-7777-777777777701";
  const buyerOrgId = "44444444-4444-4444-4444-444444444401"; // Apex Mobility
  const vendor1OrgId = "44444444-4444-4444-4444-444444444402"; // PrecisionTech (bidder)
  const vendor2OrgId = "44444444-4444-4444-4444-444444444403"; // Titan Forge (competing vendor)

  it("Vendor 1 can view its own submitted bid", () => {
    const bids = marketplaceStore.getBidsForRequirement(reqId, vendor1OrgId);
    expect(bids.length).toBe(1);
    expect(bids[0].vendor_org_id).toBe(vendor1OrgId);
  });

  it("Vendor 2 (competitor) CANNOT see Vendor 1's bid (returns empty list)", () => {
    const bids = marketplaceStore.getBidsForRequirement(reqId, vendor2OrgId);
    expect(bids.length).toBe(0);
  });

  it("Direct bid lookup by competitor returns null (zero knowledge)", () => {
    const bidId = "99999999-9999-9999-9999-999999999901";
    const bidAsCompetitor = marketplaceStore.getBidById(bidId, vendor2OrgId);
    expect(bidAsCompetitor).toBeNull();
  });

  it("Buyer can view all submitted bids for its owned requirement", () => {
    const bids = marketplaceStore.getBidsForRequirement(reqId, buyerOrgId);
    expect(bids.length).toBeGreaterThan(0);
    expect(bids.some((b) => b.vendor_org_id === vendor1OrgId)).toBe(true);
  });
});
