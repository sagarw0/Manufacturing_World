import { describe, it, expect } from "vitest";
import { marketplaceStore } from "../lib/store/mockStore";

describe("Purchase Order Lifecycle State Machine", () => {
  const bidId = "99999999-9999-9999-9999-999999999901";
  const buyerUserId = "33333333-3333-3333-3333-333333333301";
  const buyerOrgId = "44444444-4444-4444-4444-444444444401";

  it("Creates a formal PO pre-populating line items and unique PO number from accepted bid", () => {
    // 1. Accept bid first as required by strict business logic
    marketplaceStore.setSession(buyerUserId, buyerOrgId);
    marketplaceStore.acceptBid(bidId, buyerUserId);

    // 2. Now create PO
    const po = marketplaceStore.createPOFromBid(
      bidId,
      buyerUserId,
      "Chakan Plant 2, Pune, Maharashtra",
      "2026-11-30",
      "Net 45 Days payment; Door delivery DAP Pune"
    );

    expect(po).toBeDefined();
    expect(po.po_number.startsWith("PO-")).toBe(true);
    expect(po.status).toBe("issued");
    expect(po.total).toBe(3835000.00);
    expect(po.items?.length).toBeGreaterThan(0);
  });

  it("Transitions PO status through valid lifecycle stages", () => {
    const pos = marketplaceStore.getPurchaseOrders(buyerOrgId);
    const po = pos[0];
    expect(po).toBeDefined();

    // issued -> vendor_accepted
    const acceptedPO = marketplaceStore.updatePOStatus(po.id, "vendor_accepted");
    expect(acceptedPO.status).toBe("vendor_accepted");

    // vendor_accepted -> in_production
    const prodPO = marketplaceStore.updatePOStatus(po.id, "in_production");
    expect(prodPO.status).toBe("in_production");

    // in_production -> dispatched
    const dispPO = marketplaceStore.updatePOStatus(po.id, "dispatched");
    expect(dispPO.status).toBe("dispatched");

    // dispatched -> delivered
    const delivPO = marketplaceStore.updatePOStatus(po.id, "delivered");
    expect(delivPO.status).toBe("delivered");

    // delivered -> closed
    const closedPO = marketplaceStore.updatePOStatus(po.id, "closed");
    expect(closedPO.status).toBe("closed");
  });
});
