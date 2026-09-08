import { marketplaceStore } from "@/lib/store/mockStore";
import { ContactInfo, Facility, Machine, QualityCertification, WorkforceProfile } from "@/types";

export const organizationService = {
  getOrganizations() {
    return marketplaceStore.getOrganizations();
  },

  getCurrentOrganization() {
    return marketplaceStore.getCurrentOrg();
  },

  getCurrentMemberRole() {
    return marketplaceStore.getCurrentMemberRole();
  },

  getFacilities(orgId?: string): Facility[] {
    return marketplaceStore.getFacilities(orgId);
  },

  getMachines(facilityId?: string): Machine[] {
    return marketplaceStore.getMachines(facilityId);
  },

  getWorkforce(orgId?: string): WorkforceProfile[] {
    return marketplaceStore.getWorkforce(orgId);
  },

  getCertifications(orgId?: string): QualityCertification[] {
    return marketplaceStore.getCertifications(orgId);
  },

  getTechnologies(orgId?: string) {
    return marketplaceStore.getTechnologies(orgId);
  },

  getContact(targetOrgId: string, viewerOrgId?: string): ContactInfo {
    return marketplaceStore.getContactForOrg(targetOrgId, viewerOrgId);
  },

  switchSession(userId: string, orgId: string) {
    marketplaceStore.setSession(userId, orgId);
  }
};
