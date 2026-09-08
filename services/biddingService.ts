import { marketplaceStore } from "@/lib/store/mockStore";
import { Bid, BidItem, DocumentAttachment } from "@/types";

export const biddingService = {
  getBidsForRequirement(requirementId: string, viewingOrgId?: string): Bid[] {
    return marketplaceStore.getBidsForRequirement(requirementId, viewingOrgId);
  },

  getBidById(id: string, viewingOrgId?: string): Bid | null {
    return marketplaceStore.getBidById(id, viewingOrgId);
  },

  submitBid(
    data: any,
    items?: Omit<BidItem, "id" | "bid_id">[],
    attachments?: DocumentAttachment[]
  ): Bid {
    const resolvedItems = items || data.items || [];
    const resolvedAttachments = attachments || data.attachments || [];
    return marketplaceStore.submitBid(
      {
        ...data,
        attachments: resolvedAttachments,
      },
      resolvedItems
    );
  },

  acceptBid(bidId: string, buyerUserId?: string) {
    return marketplaceStore.acceptBid(bidId, buyerUserId);
  }
};

