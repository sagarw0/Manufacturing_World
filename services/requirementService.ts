import { marketplaceStore } from "@/lib/store/mockStore";
import { Requirement, RequirementItem } from "@/types";

export const requirementService = {
  getRequirements(viewerOrgId?: string): Requirement[] {
    return marketplaceStore.getRequirements(viewerOrgId);
  },

  getRequirementById(id: string): Requirement | null {
    return marketplaceStore.getRequirementById(id);
  },

  createRequirement(
    data: Omit<Requirement, "id" | "created_at" | "updated_at">,
    items: Omit<RequirementItem, "id" | "requirement_id">[]
  ): Requirement {
    return marketplaceStore.createRequirement(data, items);
  },

  publishRequirement(id: string): Requirement {
    return marketplaceStore.publishRequirement(id);
  }
};
