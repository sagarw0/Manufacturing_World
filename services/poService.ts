import { marketplaceStore } from "@/lib/store/mockStore";
import { PurchaseOrder } from "@/types";

export const poService = {
  getPurchaseOrders(viewerOrgId?: string): PurchaseOrder[] {
    return marketplaceStore.getPurchaseOrders(viewerOrgId);
  },

  getPOById(id: string): PurchaseOrder | null {
    return marketplaceStore.getPOById(id);
  },

  createPOFromBid(
    bidId: string,
    buyerUserId: string,
    deliveryAddress: string,
    deliveryDate: string,
    commercialTerms?: string
  ): PurchaseOrder {
    return marketplaceStore.createPOFromBid(
      bidId,
      buyerUserId,
      deliveryAddress,
      deliveryDate,
      commercialTerms
    );
  },

  updatePOStatus(
    poId: string,
    newStatus: PurchaseOrder["status"],
    actorUserId?: string,
    notes?: string
  ): PurchaseOrder {
    return marketplaceStore.updatePOStatus(poId, newStatus, actorUserId, notes);
  }
};
