// TypeScript definitions for Manufacturing World Supabase Database Schema

export type UserRole = 'super_admin' | 'org_admin' | 'buyer' | 'vendor';
export type OrgType = 'buyer' | 'vendor' | 'buyer_vendor';
export type OrgVerificationStatus = 'draft' | 'pending_verification' | 'verified' | 'rejected' | 'suspended';
export type RequirementStatus = 'draft' | 'published' | 'bidding_closed' | 'evaluation' | 'awarded' | 'closed' | 'cancelled';
export type BidStatus = 'draft' | 'submitted' | 'revised' | 'shortlisted' | 'clarification' | 'accepted' | 'rejected' | 'withdrawn';
export type POStatus = 'draft' | 'issued' | 'vendor_accepted' | 'vendor_rejected' | 'in_production' | 'dispatched' | 'delivered' | 'closed' | 'cancelled';
export type MachineStatus = 'operational' | 'maintenance' | 'idle' | 'decommissioned';

export interface Profile {
  id: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  legal_name: string;
  display_name: string;
  org_type: OrgType;
  description?: string;
  website?: string;
  tax_id?: string;
  business_category?: string;
  verification_status: OrgVerificationStatus;
  visibility: 'public' | 'verified_only' | 'private';
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'invited';
  created_at: string;
  profile?: Profile;
}

export interface OrganizationContact {
  id: string;
  organization_id: string;
  contact_person: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  visibility: 'public' | 'counterparties_only' | 'private';
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  area_sqft?: number;
  capacity?: string;
  operating_hours?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Machine {
  id: string;
  facility_id: string;
  machine_type: string;
  make: string;
  model: string;
  quantity: number;
  capacity?: string;
  year_of_manufacture?: number;
  certifications?: string;
  status: MachineStatus;
  created_at: string;
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  description?: string;
  created_at: string;
}

export interface OrganizationTechnology {
  id: string;
  organization_id: string;
  technology_id: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  notes?: string;
  technology?: Technology;
}

export interface WorkforceProfile {
  id: string;
  organization_id: string;
  skill_category: string;
  headcount: number;
  experience_band?: '0-2 yrs' | '3-5 yrs' | '6-10 yrs' | '10+ yrs';
  certifications?: string;
  created_at: string;
}

export interface QualityCertification {
  id: string;
  organization_id: string;
  name: string;
  certificate_no: string;
  issuing_agency?: string;
  valid_from: string;
  valid_to?: string;
  document_url?: string;
  status: 'pending' | 'verified' | 'expired' | 'rejected';
  created_at: string;
}

export interface Category {
  id: string;
  parent_id?: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface Requirement {
  id: string;
  buyer_org_id: string;
  category_id?: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  delivery_location: string;
  required_by_date: string;
  deadline: string;
  status: RequirementStatus;
  commercial_terms?: string;
  created_at: string;
  updated_at: string;
  items?: RequirementItem[];
  buyer_org?: Organization;
  category?: Category;
}

export interface RequirementItem {
  id: string;
  requirement_id: string;
  item_name: string;
  specification: string;
  material_grade?: string;
  tolerance?: string;
  quantity: number;
  unit: string;
  target_unit_price?: number;
  drawing_url?: string;
}

export interface RequirementVendor {
  id: string;
  requirement_id: string;
  vendor_org_id: string;
  invited_at: string;
  status: 'invited' | 'viewed' | 'bid_submitted' | 'declined';
  vendor_org?: Organization;
}

export interface Bid {
  id: string;
  requirement_id: string;
  vendor_org_id: string;
  version: number;
  subtotal: number;
  tax: number;
  total: number;
  lead_time_days: number;
  validity_date: string;
  payment_terms: string;
  delivery_terms?: string;
  quality_commitments?: string;
  notes?: string;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  items?: BidItem[];
  vendor_org?: Organization;
  evaluation?: BidEvaluation;
}

export interface BidItem {
  id: string;
  bid_id: string;
  requirement_item_id: string;
  unit_price: number;
  quantity: number;
  total: number;
  remarks?: string;
  requirement_item?: RequirementItem;
}

export interface Clarification {
  id: string;
  requirement_id: string;
  bid_id?: string;
  sender_org_id: string;
  sender_user_id: string;
  message: string;
  created_at: string;
  sender_org?: Organization;
  sender_profile?: Profile;
}

export interface BidEvaluation {
  id: string;
  bid_id: string;
  evaluator_user_id: string;
  price_score?: number;
  quality_score?: number;
  delivery_score?: number;
  overall_score?: number;
  notes?: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  buyer_org_id: string;
  vendor_org_id: string;
  accepted_bid_id: string;
  requirement_id: string;
  subtotal: number;
  tax: number;
  total: number;
  delivery_date: string;
  delivery_address: string;
  commercial_terms?: string;
  notes?: string;
  status: POStatus;
  issued_at?: string;
  created_at: string;
  updated_at: string;
  items?: PurchaseOrderItem[];
  buyer_org?: Organization;
  vendor_org?: Organization;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  requirement_item_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  tax: number;
  total: number;
}

export interface Notification {
  id: string;
  user_id?: string;
  organization_id?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  organization_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
  actor?: Profile;
}
