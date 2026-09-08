import { marketplaceStore } from "@/lib/store/mockStore";
import { Bid, BidItem } from "@/types";

export const biddingService = {
  getBidsForRequirement(requirementId: string, viewingOrgId?: string): Bid[] {
    return marketplaceStore.getBidsForRequirement(requirementId, viewingOrgId);
  },

  getBidById(id: string, viewingOrgId?: string): Bid | null {
    return marketplaceStore.getBidById(id, viewingOrgId);
  },

  submitBid(
    data: Omit<Bid, "id" | "created_at" | "updated_at" | "version" | "status">,
    items: Omit<BidItem, "id" | "bid_id">[]
  ): Bid {
    return marketplaceStore.submitBid(data, items);
  },

  acceptBid(bidId: string, buyerUserId?: string) {
    return marketplaceStore.acceptBid(bidId, buyerUserId);
  }
};
