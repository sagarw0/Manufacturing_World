import {
  Organization,
  Facility,
  Machine,
  Requirement,
  RequirementItem,
  RequirementVendor,
  Bid,
  BidItem,
  BidEvaluation,
  PurchaseOrder,
  PurchaseOrderItem,
  Notification,
  AuditLog,
  Profile,
  ContactInfo
} from "@/types";
import { resolveContactPrivacy } from "@/lib/privacy/contactMasker";
import {
  initialProfiles,
  initialOrganizations,
  initialMembers,
  initialContacts,
  initialFacilities,
  initialMachines,
  initialTechnologies,
  initialOrgTechnologies,
  initialWorkforce,
  initialCertifications,
  initialCategories,
  initialRequirements,
  initialRequirementItems,
  initialRequirementVendors,
  initialBids,
  initialBidItems,
} from "./seedData";

class MarketplaceStore {
  profiles = [...initialProfiles];
  organizations = [...initialOrganizations];
  members = [...initialMembers];
  contacts = [...initialContacts];
  facilities = [...initialFacilities];
  machines = [...initialMachines];
  technologies = [...initialTechnologies];
  orgTechnologies = [...initialOrgTechnologies];
  workforce = [...initialWorkforce];
  certifications = [...initialCertifications];
  categories = [...initialCategories];
  requirements = [...initialRequirements];
  requirementItems = [...initialRequirementItems];
  requirementVendors = [...initialRequirementVendors];
  bids = [...initialBids];
  bidItems = [...initialBidItems];
  evaluations: BidEvaluation[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  purchaseOrderItems: PurchaseOrderItem[] = [];
  notifications: Notification[] = [];
  auditLogs: AuditLog[] = [
    {
      id: "al-01",
      actor_user_id: "33333333-3333-3333-3333-333333333301",
      organization_id: "44444444-4444-4444-4444-444444444401",
      entity_type: "requirement",
      entity_id: "77777777-7777-7777-7777-777777777701",
      action: "publish_requirement",
      metadata: { title: "Precision CNC Machined EV Motor Housing & Inverter End-Caps" },
      created_at: new Date().toISOString(),
    },
    {
      id: "al-02",
      actor_user_id: "33333333-3333-3333-3333-333333333302",
      organization_id: "44444444-4444-4444-4444-444444444402",
      entity_type: "bid",
      entity_id: "99999999-9999-9999-9999-999999999901",
      action: "submit_bid",
      metadata: { total: 3835000.00, version: 1 },
      created_at: new Date().toISOString(),
    }
  ];

  currentUserProfileId: string = "33333333-3333-3333-3333-333333333301";
  currentOrganizationId: string = "44444444-4444-4444-4444-444444444401";

  setSession(userId: string, orgId: string) {
    this.currentUserProfileId = userId;
    this.currentOrganizationId = orgId;
  }

  getCurrentUser() {
    return this.profiles.find((p) => p.id === this.currentUserProfileId);
  }

  getCurrentOrg() {
    return this.organizations.find((o) => o.id === this.currentOrganizationId);
  }

  getCurrentMemberRole() {
    const mem = this.members.find(
      (m) => m.organization_id === this.currentOrganizationId && m.user_id === this.currentUserProfileId
    );
    return mem ? mem.role : "buyer";
  }

  getOrganizations() {
    return this.organizations;
  }

  getFacilities(orgId?: string) {
    const target = orgId || this.currentOrganizationId;
    return this.facilities.filter((f) => f.organization_id === target);
  }

  getMachines(facilityId?: string) {
    if (facilityId) {
      return this.machines.filter((m) => m.facility_id === facilityId);
    }
    const myFacilityIds = this.getFacilities().map((f) => f.id);
    return this.machines.filter((m) => myFacilityIds.includes(m.facility_id));
  }

  getWorkforce(orgId?: string) {
    const target = orgId || this.currentOrganizationId;
    return this.workforce.filter((w) => w.organization_id === target);
  }

  getCertifications(orgId?: string) {
    const target = orgId || this.currentOrganizationId;
    return this.certifications.filter((c) => c.organization_id === target);
  }

  getTechnologies(orgId?: string) {
    const target = orgId || this.currentOrganizationId;
    const orgTechs = this.orgTechnologies.filter((ot) => ot.organization_id === target);
    return orgTechs.map((ot) => ({
      ...ot,
      technology: this.technologies.find((t) => t.id === ot.technology_id),
    }));
  }

  getRequirements(viewerOrgId?: string): Requirement[] {
    const orgId = viewerOrgId || this.currentOrganizationId;

    return this.requirements
      .filter((r) => {
        if (r.buyer_org_id === orgId) return true;
        if (r.status !== "draft") {
          return this.requirementVendors.some(
            (rv) => rv.requirement_id === r.id && rv.vendor_org_id === orgId
          );
        }
        return false;
      })
      .map((r) => this.hydrateRequirement(r));
  }

  getRequirementById(id: string): Requirement | null {
    const r = this.requirements.find((req) => req.id === id);
    if (!r) return null;
    return this.hydrateRequirement(r);
  }

  private hydrateRequirement(r: Requirement): Requirement {
    const buyerOrg = this.organizations.find((o) => o.id === r.buyer_org_id);
    const category = this.categories.find((c) => c.id === r.category_id);
    const items = this.requirementItems.filter((ri) => ri.requirement_id === r.id);
    return {
      ...r,
      buyer_org: buyerOrg,
      category: category,
      items: items,
    };
  }

  createRequirement(
    data: Omit<Requirement, "id" | "created_at" | "updated_at">,
    items: Omit<RequirementItem, "id" | "requirement_id">[]
  ): Requirement {
    const reqId = `req-${Date.now()}`;
    const newReq: Requirement = {
      ...data,
      id: reqId,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.requirements.unshift(newReq);

    const createdItems: RequirementItem[] = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
      requirement_id: reqId,
    }));
    this.requirementItems.push(...createdItems);

    this.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actor_user_id: this.currentUserProfileId,
      organization_id: this.currentOrganizationId,
      entity_type: "requirement",
      entity_id: reqId,
      action: "create_requirement_draft",
      metadata: { title: data.title },
      created_at: new Date().toISOString(),
    });

    return this.hydrateRequirement(newReq);
  }

  publishRequirement(reqId: string): Requirement {
    const req = this.requirements.find((r) => r.id === reqId);
    if (!req) throw new Error("Requirement not found");

    req.status = "published";
    req.updated_at = new Date().toISOString();

    const eligibleVendors = this.organizations.filter(
      (o) => o.org_type === "vendor" || o.org_type === "buyer_vendor"
    );
    eligibleVendors.forEach((v) => {
      const exists = this.requirementVendors.some(
        (rv) => rv.requirement_id === reqId && rv.vendor_org_id === v.id
      );
      if (!exists) {
        this.requirementVendors.push({
          id: `rv-${Date.now()}-${v.id.slice(0, 4)}`,
          requirement_id: reqId,
          vendor_org_id: v.id,
          invited_at: new Date().toISOString(),
          status: "invited",
        });
      }
    });

    this.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actor_user_id: this.currentUserProfileId,
      organization_id: this.currentOrganizationId,
      entity_type: "requirement",
      entity_id: reqId,
      action: "publish_requirement",
      metadata: { eligible_vendors_count: eligibleVendors.length },
      created_at: new Date().toISOString(),
    });

    return this.hydrateRequirement(req);
  }

  getBidsForRequirement(requirementId: string, viewingOrgId?: string): Bid[] {
    const orgId = viewingOrgId || this.currentOrganizationId;
    const req = this.requirements.find((r) => r.id === requirementId);
    if (!req) return [];

    const isBuyer = req.buyer_org_id === orgId;

    return this.bids
      .filter((b) => {
        if (b.requirement_id !== requirementId) return false;
        if (isBuyer) return true;
        // Strict BID ISOLATION
        return b.vendor_org_id === orgId;
      })
      .map((b) => this.hydrateBid(b));
  }

  getBidById(id: string, viewingOrgId?: string): Bid | null {
    const orgId = viewingOrgId || this.currentOrganizationId;
    const b = this.bids.find((bid) => bid.id === id);
    if (!b) return null;

    const req = this.requirements.find((r) => r.id === b.requirement_id);
    const isBuyer = req?.buyer_org_id === orgId;
    const isOwnerVendor = b.vendor_org_id === orgId;

    if (!isBuyer && !isOwnerVendor) {
      return null;
    }

    return this.hydrateBid(b);
  }

  private hydrateBid(b: Bid): Bid {
    const vendorOrg = this.organizations.find((o) => o.id === b.vendor_org_id);
    const items = this.bidItems
      .filter((bi) => bi.bid_id === b.id)
      .map((bi) => ({
        ...bi,
        requirement_item: this.requirementItems.find((ri) => ri.id === bi.requirement_item_id),
      }));
    const evalObj = this.evaluations.find((e) => e.bid_id === b.id);

    return {
      ...b,
      vendor_org: vendorOrg,
      items: items,
      evaluation: evalObj,
    };
  }

  submitBid(
    data: Omit<Bid, "id" | "created_at" | "updated_at" | "version" | "status">,
    items: Omit<BidItem, "id" | "bid_id">[]
  ): Bid {
    const req = this.requirements.find((r) => r.id === data.requirement_id);
    if (!req) throw new Error("Requirement not found");

    if (new Date(req.deadline) < new Date()) {
      throw new Error("Cannot submit bid: Bidding deadline has passed");
    }

    const existing = this.bids.find(
      (b) => b.requirement_id === data.requirement_id && b.vendor_org_id === data.vendor_org_id
    );

    let bidId: string;
    let newBid: Bid;

    if (existing) {
      existing.status = "revised";
      existing.version += 1;
      existing.subtotal = data.subtotal;
      existing.tax = data.tax;
      existing.total = data.total;
      existing.lead_time_days = data.lead_time_days;
      existing.validity_date = data.validity_date;
      existing.payment_terms = data.payment_terms;
      existing.delivery_terms = data.delivery_terms;
      existing.quality_commitments = data.quality_commitments;
      existing.notes = data.notes;
      existing.updated_at = new Date().toISOString();
      bidId = existing.id;
      newBid = existing;

      this.bidItems = this.bidItems.filter((bi) => bi.bid_id !== bidId);
    } else {
      bidId = `bid-${Date.now()}`;
      newBid = {
        ...data,
        id: bidId,
        version: 1,
        status: "submitted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.bids.unshift(newBid);
    }

    const createdItems: BidItem[] = items.map((it, idx) => ({
      ...it,
      id: `bi-${Date.now()}-${idx}`,
      bid_id: bidId,
    }));
    this.bidItems.push(...createdItems);

    const rv = this.requirementVendors.find(
      (m) => m.requirement_id === data.requirement_id && m.vendor_org_id === data.vendor_org_id
    );
    if (rv) rv.status = "bid_submitted";

    this.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actor_user_id: this.currentUserProfileId,
      organization_id: data.vendor_org_id,
      entity_type: "bid",
      entity_id: bidId,
      action: existing ? "revise_bid" : "submit_bid",
      metadata: { total: data.total, version: newBid.version },
      created_at: new Date().toISOString(),
    });

    return this.hydrateBid(newBid);
  }

  acceptBid(bidId: string, buyerUserId?: string): { success: boolean; bid: Bid; requirement: Requirement } {
    const actorId = buyerUserId || this.currentUserProfileId;
    const bid = this.bids.find((b) => b.id === bidId);
    if (!bid) throw new Error("Bid not found");

    const req = this.requirements.find((r) => r.id === bid.requirement_id);
    if (!req) throw new Error("Requirement not found");

    bid.status = "accepted";
    bid.updated_at = new Date().toISOString();

    this.bids.forEach((b) => {
      if (b.requirement_id === req.id && b.id !== bidId) {
        b.status = "rejected";
        b.updated_at = new Date().toISOString();
      }
    });

    req.status = "awarded";
    req.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actor_user_id: actorId,
      organization_id: req.buyer_org_id,
      entity_type: "bid",
      entity_id: bidId,
      action: "accept_bid",
      metadata: {
        winning_vendor_org_id: bid.vendor_org_id,
        bid_total: bid.total,
        requirement_id: req.id,
      },
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      bid: this.hydrateBid(bid),
      requirement: this.hydrateRequirement(req),
    };
  }

  getPurchaseOrders(viewerOrgId?: string): PurchaseOrder[] {
    const orgId = viewerOrgId || this.currentOrganizationId;
    return this.purchaseOrders
      .filter((po) => po.buyer_org_id === orgId || po.vendor_org_id === orgId)
      .map((po) => this.hydratePO(po));
  }

  getPOById(id: string): PurchaseOrder | null {
    const po = this.purchaseOrders.find((p) => p.id === id);
    if (!po) return null;
    return this.hydratePO(po);
  }

  private hydratePO(po: PurchaseOrder): PurchaseOrder {
    const buyerOrg = this.organizations.find((o) => o.id === po.buyer_org_id);
    const vendorOrg = this.organizations.find((o) => o.id === po.vendor_org_id);
    const items = this.purchaseOrderItems.filter((poi) => poi.purchase_order_id === po.id);
    return {
      ...po,
      buyer_org: buyerOrg,
      vendor_org: vendorOrg,
      items: items,
    };
  }

  createPOFromBid(
    bidId: string,
    buyerUserId: string,
    deliveryAddress: string,
    deliveryDate: string,
    commercialTerms?: string
  ): PurchaseOrder {
    const bid = this.bids.find((b) => b.id === bidId);
    if (!bid) throw new Error("Bid not found");
    if (bid.status !== "accepted") {
      throw new Error("Cannot create PO: Bid has not been accepted");
    }

    const existingPO = this.purchaseOrders.find((p) => p.accepted_bid_id === bidId);
    if (existingPO) {
      throw new Error("A Purchase Order already exists for this accepted bid");
    }

    const req = this.requirements.find((r) => r.id === bid.requirement_id);
    if (!req) throw new Error("Requirement not found");

    const poId = `po-${Date.now()}`;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const poNumber = `PO-${dateStr}-${randNum}`;

    const newPO: PurchaseOrder = {
      id: poId,
      po_number: poNumber,
      buyer_org_id: req.buyer_org_id,
      vendor_org_id: bid.vendor_org_id,
      accepted_bid_id: bid.id,
      requirement_id: req.id,
      subtotal: bid.subtotal,
      tax: bid.tax,
      total: bid.total,
      delivery_date: deliveryDate,
      delivery_address: deliveryAddress,
      commercial_terms: commercialTerms || `${bid.payment_terms} | ${bid.delivery_terms || "Standard Delivery"}`,
      status: "issued",
      issued_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.purchaseOrders.unshift(newPO);

    const bItems = this.bidItems.filter((bi) => bi.bid_id === bidId);
    bItems.forEach((bi, idx) => {
      const ri = this.requirementItems.find((r) => r.id === bi.requirement_item_id);
      this.purchaseOrderItems.push({
        id: `poi-${Date.now()}-${idx}`,
        purchase_order_id: poId,
        requirement_item_id: bi.requirement_item_id,
        description: `${ri?.item_name || "Line Item"} (${bi.remarks || "Precision Spec"})`,
        quantity: bi.quantity,
        unit: ri?.unit || "Nos",
        unit_price: bi.unit_price,
        tax: 0,
        total: bi.total,
      });
    });

    this.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actor_user_id: buyerUserId,
      organization_id: req.buyer_org_id,
      entity_type: "purchase_order",
      entity_id: poId,
      action: "create_po",
      metadata: { po_number: poNumber, total: bid.total },
      created_at: new Date().toISOString(),
    });

    return this.hydratePO(newPO);
  }

  updatePOStatus(poId: string, newStatus: PurchaseOrder["status"], actorUserId?: string, notes?: string): PurchaseOrder {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) throw new Error("Purchase Order not found");

    const prev = po.status;
    po.status = newStatus;
    if (notes) po.notes = notes;
    po.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `al-${Date.now()}`,
      actor_user_id: actorUserId || this.currentUserProfileId,
      organization_id: this.currentOrganizationId,
      entity_type: "purchase_order",
      entity_id: poId,
      action: "change_po_status",
      metadata: { from_status: prev, to_status: newStatus, notes },
      created_at: new Date().toISOString(),
    });

    return this.hydratePO(po);
  }

  getContactForOrg(targetOrgId: string, viewerOrgId?: string): ContactInfo {
    const vOrgId = viewerOrgId || this.currentOrganizationId;
    const contact = this.contacts.find((c) => c.organization_id === targetOrgId);

    if (vOrgId === targetOrgId) {
      return resolveContactPrivacy(contact, true);
    }

    const hasAcceptedBid = this.bids.some((b) => {
      if (b.status !== "accepted") return false;
      const req = this.requirements.find((r) => r.id === b.requirement_id);
      if (!req) return false;

      if (req.buyer_org_id === vOrgId && b.vendor_org_id === targetOrgId) return true;
      if (b.vendor_org_id === vOrgId && req.buyer_org_id === targetOrgId) return true;
      return false;
    });

    const hasActivePO = this.purchaseOrders.some((po) => {
      return (
        (po.buyer_org_id === vOrgId && po.vendor_org_id === targetOrgId) ||
        (po.vendor_org_id === vOrgId && po.buyer_org_id === targetOrgId)
      );
    });

    const isAuthorized = hasAcceptedBid || hasActivePO;
    return resolveContactPrivacy(contact, isAuthorized);
  }

  getAuditLogs() {
    return this.auditLogs.map((al) => ({
      ...al,
      actor: this.profiles.find((p) => p.id === al.actor_user_id),
    }));
  }
}

export const marketplaceStore = new MarketplaceStore();
