-- ====================================================================
-- Manufacturing World: Row Level Security & Contact Privacy Policies
-- Migration: 00002_rls_policies.sql
-- ====================================================================

-- 1. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS TABLE (org_id UUID) AS $$
    SELECT organization_id 
    FROM public.organization_members 
    WHERE user_id = public.current_profile_id() 
      AND status = 'active';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_accepted_counterparty_relationship(target_org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    curr_user_id UUID := public.current_profile_id();
BEGIN
    -- Check if target_org is an accepted vendor to current user's buyer organization
    IF EXISTS (
        SELECT 1 
        FROM public.bids b
        JOIN public.requirements r ON b.requirement_id = r.id
        JOIN public.organization_members om ON r.buyer_org_id = om.organization_id
        WHERE om.user_id = curr_user_id
          AND b.vendor_org_id = target_org_id
          AND b.status = 'accepted'
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check if target_org is a buyer who accepted current user's vendor quotation
    IF EXISTS (
        SELECT 1 
        FROM public.bids b
        JOIN public.requirements r ON b.requirement_id = r.id
        JOIN public.organization_members om ON b.vendor_org_id = om.organization_id
        WHERE om.user_id = curr_user_id
          AND r.buyer_org_id = target_org_id
          AND b.status = 'accepted'
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check if an active Purchase Order exists between the two organizations
    IF EXISTS (
        SELECT 1
        FROM public.purchase_orders po
        JOIN public.organization_members om ON (po.buyer_org_id = om.organization_id OR po.vendor_org_id = om.organization_id)
        WHERE om.user_id = curr_user_id
          AND (po.buyer_org_id = target_org_id OR po.vendor_org_id = target_org_id)
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workforce_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES POLICIES
CREATE POLICY profiles_select_all ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth_user_id = auth.uid());

-- 4. ORGANIZATIONS POLICIES
CREATE POLICY orgs_select_public ON public.organizations FOR SELECT USING (
    visibility = 'public' 
    OR id IN (SELECT org_id FROM public.get_user_org_ids())
);
CREATE POLICY orgs_update_admin ON public.organizations FOR UPDATE USING (
    id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = public.current_profile_id() AND role IN ('org_admin', 'super_admin')
    )
);

-- 5. ORGANIZATION CONTACTS (PRIVACY MASKING ENFORCEMENT)
-- Direct contact info is viewable ONLY by members of that organization OR accepted counterparties!
CREATE POLICY contacts_select_policy ON public.organization_contacts FOR SELECT USING (
    organization_id IN (SELECT org_id FROM public.get_user_org_ids())
    OR public.has_accepted_counterparty_relationship(organization_id)
);
CREATE POLICY contacts_manage_own ON public.organization_contacts FOR ALL USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = public.current_profile_id() AND role IN ('org_admin', 'super_admin')
    )
);

-- 6. CAPABILITIES (FACILITIES, MACHINES, TECHNOLOGIES, WORKFORCE, CERTIFICATIONS)
CREATE POLICY facilities_view ON public.facilities FOR SELECT USING (true);
CREATE POLICY facilities_manage ON public.facilities FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_org_ids())
);

CREATE POLICY machines_view ON public.machines FOR SELECT USING (true);
CREATE POLICY machines_manage ON public.machines FOR ALL USING (
    facility_id IN (
        SELECT id FROM public.facilities WHERE organization_id IN (SELECT org_id FROM public.get_user_org_ids())
    )
);

CREATE POLICY technologies_read ON public.technologies FOR SELECT USING (true);
CREATE POLICY org_technologies_read ON public.organization_technologies FOR SELECT USING (true);
CREATE POLICY org_technologies_manage ON public.organization_technologies FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_org_ids())
);

CREATE POLICY workforce_view ON public.workforce_profiles FOR SELECT USING (true);
CREATE POLICY workforce_manage ON public.workforce_profiles FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_org_ids())
);

CREATE POLICY certs_view ON public.quality_certifications FOR SELECT USING (true);
CREATE POLICY certs_manage ON public.quality_certifications FOR ALL USING (
    organization_id IN (SELECT org_id FROM public.get_user_org_ids())
);

CREATE POLICY categories_read ON public.categories FOR SELECT USING (true);

-- 7. REQUIREMENTS & ITEMS POLICIES
CREATE POLICY requirements_select_policy ON public.requirements FOR SELECT USING (
    -- Buyer org members can see their own requirements
    buyer_org_id IN (SELECT org_id FROM public.get_user_org_ids())
    -- Eligible vendors can see published/active requirements
    OR (
        status IN ('published', 'bidding_closed', 'evaluation', 'awarded')
        AND id IN (
            SELECT requirement_id FROM public.requirement_vendors 
            WHERE vendor_org_id IN (SELECT org_id FROM public.get_user_org_ids())
        )
    )
);

CREATE POLICY requirements_manage_buyer ON public.requirements FOR ALL USING (
    buyer_org_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = public.current_profile_id() AND role IN ('buyer', 'org_admin', 'super_admin')
    )
);

CREATE POLICY req_items_select ON public.requirement_items FOR SELECT USING (
    requirement_id IN (SELECT id FROM public.requirements)
);

-- 8. BIDS (STRICT VENDOR ISOLATION)
-- Vendor can see ONLY its own bids.
-- Buyer can see bids for requirements owned by buyer organization.
CREATE POLICY bids_select_policy ON public.bids FOR SELECT USING (
    vendor_org_id IN (SELECT org_id FROM public.get_user_org_ids())
    OR requirement_id IN (
        SELECT id FROM public.requirements WHERE buyer_org_id IN (SELECT org_id FROM public.get_user_org_ids())
    )
);

CREATE POLICY bids_insert_vendor ON public.bids FOR INSERT WITH CHECK (
    vendor_org_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = public.current_profile_id() AND role IN ('vendor', 'org_admin')
    )
);

CREATE POLICY bids_update_vendor ON public.bids FOR UPDATE USING (
    vendor_org_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = public.current_profile_id() AND role IN ('vendor', 'org_admin')
    )
    AND status IN ('draft', 'submitted', 'revised')
);

CREATE POLICY bid_items_select ON public.bid_items FOR SELECT USING (
    bid_id IN (SELECT id FROM public.bids)
);

-- 9. PURCHASE ORDERS
CREATE POLICY po_select_policy ON public.purchase_orders FOR SELECT USING (
    buyer_org_id IN (SELECT org_id FROM public.get_user_org_ids())
    OR vendor_org_id IN (SELECT org_id FROM public.get_user_org_ids())
);

CREATE POLICY po_items_select ON public.purchase_order_items FOR SELECT USING (
    purchase_order_id IN (SELECT id FROM public.purchase_orders)
);

-- 10. AUDIT LOGS & NOTIFICATIONS
CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT USING (
    organization_id IN (SELECT org_id FROM public.get_user_org_ids())
    OR actor_user_id = public.current_profile_id()
);

CREATE POLICY notifications_user ON public.notifications FOR ALL USING (
    user_id = public.current_profile_id()
    OR organization_id IN (SELECT org_id FROM public.get_user_org_ids())
);
