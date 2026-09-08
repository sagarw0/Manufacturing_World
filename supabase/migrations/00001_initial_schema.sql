-- ====================================================================
-- Manufacturing World: B2B Marketplace Schema
-- Migration: 00001_initial_schema.sql
-- Description: Core 24 tables for organizations, capabilities, requirements,
--              bids, evaluations, purchase orders, audit trail & notifications.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    org_type TEXT NOT NULL CHECK (org_type IN ('buyer', 'vendor', 'buyer_vendor')),
    description TEXT,
    website TEXT,
    tax_id TEXT, -- GSTIN/EIN
    business_category TEXT,
    verification_status TEXT NOT NULL DEFAULT 'draft' CHECK (verification_status IN ('draft', 'pending_verification', 'verified', 'rejected', 'suspended')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'verified_only', 'private')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORGANIZATION MEMBERS
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'buyer', 'vendor')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. ORGANIZATION CONTACTS (PROTECTED SENSITIVE DATA)
CREATE TABLE IF NOT EXISTS public.organization_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'counterparties_only', 'private')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FACILITIES (SHOPS / FACTORIES)
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    area_sqft NUMERIC(12, 2),
    capacity TEXT,
    operating_hours TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MACHINES (VENDOR MACHINERY REGISTRY)
CREATE TABLE IF NOT EXISTS public.machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    machine_type TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    capacity TEXT,
    year_of_manufacture INTEGER,
    certifications TEXT,
    status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'idle', 'decommissioned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TECHNOLOGIES MASTER
CREATE TABLE IF NOT EXISTS public.technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ORGANIZATION TECHNOLOGIES
CREATE TABLE IF NOT EXISTS public.organization_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    technology_id UUID NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
    proficiency TEXT CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, technology_id)
);

-- 9. WORKFORCE PROFILES (AGGREGATED SKILLS)
CREATE TABLE IF NOT EXISTS public.workforce_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    skill_category TEXT NOT NULL,
    headcount INTEGER NOT NULL CHECK (headcount >= 0),
    experience_band TEXT CHECK (experience_band IN ('0-2 yrs', '3-5 yrs', '6-10 yrs', '10+ yrs')),
    certifications TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. QUALITY CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.quality_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    certificate_no TEXT NOT NULL,
    issuing_agency TEXT,
    valid_from DATE NOT NULL,
    valid_to DATE,
    document_url TEXT,
    status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'expired', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CATEGORIES MASTER
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. REQUIREMENTS (BUYER RFQs)
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(14, 2) NOT NULL,
    unit TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    required_by_date DATE NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'bidding_closed', 'evaluation', 'awarded', 'closed', 'cancelled')),
    commercial_terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. REQUIREMENT ITEMS (LINE ITEMS & SPECIFICATIONS)
CREATE TABLE IF NOT EXISTS public.requirement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    specification TEXT NOT NULL,
    material_grade TEXT,
    tolerance TEXT,
    quantity NUMERIC(14, 2) NOT NULL,
    unit TEXT NOT NULL,
    target_unit_price NUMERIC(14, 2),
    drawing_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. REQUIREMENT VENDORS (ELIGIBILITY MAPPING)
CREATE TABLE IF NOT EXISTS public.requirement_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
    vendor_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'viewed', 'bid_submitted', 'declined')),
    UNIQUE(requirement_id, vendor_org_id)
);

-- 15. BIDS (VENDOR QUOTATIONS)
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
    vendor_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC(14, 2) NOT NULL,
    tax NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(14, 2) NOT NULL,
    lead_time_days INTEGER NOT NULL,
    validity_date DATE NOT NULL,
    payment_terms TEXT NOT NULL,
    delivery_terms TEXT,
    quality_commitments TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'revised', 'shortlisted', 'clarification', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. BID ITEMS (PRICING BREAKDOWN)
CREATE TABLE IF NOT EXISTS public.bid_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID NOT NULL REFERENCES public.bids(id) ON DELETE CASCADE,
    requirement_item_id UUID NOT NULL REFERENCES public.requirement_items(id) ON DELETE CASCADE,
    unit_price NUMERIC(14, 2) NOT NULL,
    quantity NUMERIC(14, 2) NOT NULL,
    total NUMERIC(14, 2) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. BID ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.bid_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID NOT NULL REFERENCES public.bids(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. CLARIFICATIONS (BUYER - VENDOR PRIVATE THREADS)
CREATE TABLE IF NOT EXISTS public.clarifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
    bid_id UUID REFERENCES public.bids(id) ON DELETE CASCADE,
    sender_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. BID EVALUATIONS (BUYER SCORING)
CREATE TABLE IF NOT EXISTS public.bid_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID NOT NULL REFERENCES public.bids(id) ON DELETE CASCADE,
    evaluator_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    price_score NUMERIC(5, 2) CHECK (price_score >= 0 AND price_score <= 100),
    quality_score NUMERIC(5, 2) CHECK (quality_score >= 0 AND quality_score <= 100),
    delivery_score NUMERIC(5, 2) CHECK (delivery_score >= 0 AND delivery_score <= 100),
    overall_score NUMERIC(5, 2) CHECK (overall_score >= 0 AND overall_score <= 100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bid_id, evaluator_user_id)
);

-- 20. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT NOT NULL UNIQUE,
    buyer_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    vendor_org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    accepted_bid_id UUID NOT NULL REFERENCES public.bids(id) ON DELETE RESTRICT UNIQUE,
    requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE RESTRICT,
    subtotal NUMERIC(14, 2) NOT NULL,
    tax NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(14, 2) NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    commercial_terms TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'vendor_accepted', 'vendor_rejected', 'in_production', 'dispatched', 'delivered', 'closed', 'cancelled')),
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. PURCHASE ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    requirement_item_id UUID NOT NULL REFERENCES public.requirement_items(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    quantity NUMERIC(14, 2) NOT NULL,
    unit TEXT NOT NULL,
    unit_price NUMERIC(14, 2) NOT NULL,
    tax NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'organization', 'machine', 'requirement', 'bid', 'po'
    entity_id UUID NOT NULL,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    document_type TEXT,
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. AUDIT LOGS (IMMUTABLE TRAIL)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_facilities_org ON public.facilities(organization_id);
CREATE INDEX IF NOT EXISTS idx_machines_facility ON public.machines(facility_id);
CREATE INDEX IF NOT EXISTS idx_req_buyer ON public.requirements(buyer_org_id);
CREATE INDEX IF NOT EXISTS idx_req_status ON public.requirements(status);
CREATE INDEX IF NOT EXISTS idx_req_vendors_req ON public.requirement_vendors(requirement_id);
CREATE INDEX IF NOT EXISTS idx_req_vendors_vendor ON public.requirement_vendors(vendor_org_id);
CREATE INDEX IF NOT EXISTS idx_bids_req ON public.bids(requirement_id);
CREATE INDEX IF NOT EXISTS idx_bids_vendor ON public.bids(vendor_org_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_po_buyer ON public.purchase_orders(buyer_org_id);
CREATE INDEX IF NOT EXISTS idx_po_vendor ON public.purchase_orders(vendor_org_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);
