-- Manufacturing World: Neon Serverless PostgreSQL Database Schema
-- Optimized for Neon serverless pooler (PgBouncer) and Vercel edge/serverless compute

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for clean migration
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS bid_evaluations CASCADE;
DROP TABLE IF EXISTS bid_attachments CASCADE;
DROP TABLE IF EXISTS bid_items CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS requirement_attachments CASCADE;
DROP TABLE IF EXISTS requirement_vendors CASCADE;
DROP TABLE IF EXISTS requirement_items CASCADE;
DROP TABLE IF EXISTS requirements CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS quality_certifications CASCADE;
DROP TABLE IF EXISTS workforce_profiles CASCADE;
DROP TABLE IF EXISTS organization_technologies CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS organization_contacts CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS documents CASCADE;

-- 1. Documents (Storage for Images, CAD, PDFs, Quotes)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_category VARCHAR(50) DEFAULT 'other' CHECK (file_category IN ('drawing', 'specification', 'cad_model', 'quote', 'test_cert', 'invoice', 'other')),
    uploaded_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organizations (Buyers, Vendors, or Dual)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    org_type VARCHAR(50) NOT NULL CHECK (org_type IN ('buyer', 'vendor', 'buyer_vendor')),
    description TEXT,
    website VARCHAR(255),
    tax_id VARCHAR(100),
    business_category VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'pending_verification' CHECK (verification_status IN ('draft', 'pending_verification', 'verified', 'rejected', 'suspended')),
    visibility VARCHAR(50) DEFAULT 'verified_only' CHECK (visibility IN ('public', 'verified_only', 'private')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Organization Members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'buyer', 'vendor')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Organization Contacts (Protected with Data Masking)
CREATE TABLE organization_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    visibility VARCHAR(50) DEFAULT 'counterparties_only' CHECK (visibility IN ('public', 'counterparties_only', 'private')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Facilities & Machinery
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    area_sqft NUMERIC(12,2),
    capacity VARCHAR(255),
    operating_hours VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    machine_type VARCHAR(100) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    capacity VARCHAR(255),
    year_of_manufacture INTEGER,
    certifications TEXT,
    status VARCHAR(50) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'idle', 'decommissioned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Categories & Requirements (RFQs)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    delivery_location TEXT NOT NULL,
    required_by_date DATE NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'bidding_closed', 'evaluation', 'awarded', 'closed', 'cancelled')),
    commercial_terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE requirement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    specification TEXT NOT NULL,
    material_grade VARCHAR(100),
    tolerance VARCHAR(100),
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    target_unit_price NUMERIC(12,2),
    drawing_url TEXT
);

CREATE TABLE requirement_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT,
    mime_type VARCHAR(100),
    file_category VARCHAR(50) DEFAULT 'drawing',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Isolated Bidding & Quotations
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE RESTRICT,
    vendor_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    version INTEGER DEFAULT 1,
    subtotal NUMERIC(14,2) NOT NULL,
    tax NUMERIC(14,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) NOT NULL,
    lead_time_days INTEGER NOT NULL,
    validity_date DATE NOT NULL,
    payment_terms TEXT NOT NULL,
    delivery_terms TEXT,
    quality_commitments TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'revised', 'shortlisted', 'clarification', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bid_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    requirement_item_id UUID NOT NULL REFERENCES requirement_items(id) ON DELETE CASCADE,
    unit_price NUMERIC(12,2) NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    total NUMERIC(14,2) NOT NULL,
    remarks TEXT
);

CREATE TABLE bid_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT,
    mime_type VARCHAR(100),
    file_category VARCHAR(50) DEFAULT 'quote',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bid_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    evaluator_user_id UUID NOT NULL REFERENCES profiles(id),
    price_score NUMERIC(5,2),
    quality_score NUMERIC(5,2),
    delivery_score NUMERIC(5,2),
    overall_score NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Purchase Orders (PO Engine)
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    buyer_org_id UUID NOT NULL REFERENCES organizations(id),
    vendor_org_id UUID NOT NULL REFERENCES organizations(id),
    accepted_bid_id UUID NOT NULL REFERENCES bids(id),
    requirement_id UUID NOT NULL REFERENCES requirements(id),
    subtotal NUMERIC(14,2) NOT NULL,
    tax NUMERIC(14,2) NOT NULL DEFAULT 0,
    total NUMERIC(14,2) NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    commercial_terms TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'vendor_accepted', 'vendor_rejected', 'in_production', 'dispatched', 'delivered', 'closed', 'cancelled')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    requirement_item_id UUID REFERENCES requirement_items(id),
    description TEXT NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    tax NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(14,2) NOT NULL
);

-- 10. Notifications & Audit Logs
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES profiles(id),
    organization_id UUID REFERENCES organizations(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_requirements_buyer ON requirements(buyer_org_id);
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_bids_requirement ON bids(requirement_id);
CREATE INDEX idx_bids_vendor ON bids(vendor_org_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_buyer ON purchase_orders(buyer_org_id);
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_org_id);
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_req_attachments ON requirement_attachments(requirement_id);
CREATE INDEX idx_bid_attachments ON bid_attachments(bid_id);
