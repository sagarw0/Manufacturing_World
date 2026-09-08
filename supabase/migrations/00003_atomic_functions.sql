-- ====================================================================
-- Manufacturing World: Atomic Transactions & Business Operations
-- Migration: 00003_atomic_functions.sql
-- ====================================================================

-- 1. ATOMIC BID ACCEPTANCE
CREATE OR REPLACE FUNCTION public.accept_bid(
    p_bid_id UUID,
    p_buyer_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_bid RECORD;
    v_req RECORD;
    v_buyer_org_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Fetch bid details
    SELECT * INTO v_bid FROM public.bids WHERE id = p_bid_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bid % does not exist', p_bid_id;
    END IF;

    -- 2. Fetch requirement details
    SELECT * INTO v_req FROM public.requirements WHERE id = v_bid.requirement_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated requirement % does not exist', v_bid.requirement_id;
    END IF;

    v_buyer_org_id := v_req.buyer_org_id;

    -- 3. Verify that the user is an authorized buyer member of the buyer organization
    IF NOT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = v_buyer_org_id
          AND user_id = p_buyer_user_id
          AND role IN ('buyer', 'org_admin', 'super_admin')
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'User % is not authorized to accept bids for organization %', p_buyer_user_id, v_buyer_org_id;
    END IF;

    -- 4. Check if requirement is in valid state for award
    IF v_req.status NOT IN ('published', 'bidding_closed', 'evaluation') THEN
        RAISE EXCEPTION 'Requirement cannot be awarded because current status is %', v_req.status;
    END IF;

    -- 5. Atomic Update: Winning bid status -> accepted
    UPDATE public.bids
    SET status = 'accepted', updated_at = NOW()
    WHERE id = p_bid_id;

    -- 6. Atomic Update: Competing bids -> rejected
    UPDATE public.bids
    SET status = 'rejected', updated_at = NOW()
    WHERE requirement_id = v_req.id
      AND id <> p_bid_id
      AND status IN ('submitted', 'revised', 'shortlisted', 'clarification');

    -- 7. Atomic Update: Requirement status -> awarded
    UPDATE public.requirements
    SET status = 'awarded', updated_at = NOW()
    WHERE id = v_req.id;

    -- 8. Immutable Audit Log
    INSERT INTO public.audit_logs (
        actor_user_id,
        organization_id,
        entity_type,
        entity_id,
        action,
        metadata
    ) VALUES (
        p_buyer_user_id,
        v_buyer_org_id,
        'bid',
        p_bid_id,
        'accept_bid',
        jsonb_build_object(
            'requirement_id', v_req.id,
            'requirement_title', v_req.title,
            'winning_vendor_org_id', v_bid.vendor_org_id,
            'bid_total', v_bid.total,
            'currency', 'INR'
        )
    );

    -- 9. In-app Notification for Winning Vendor
    INSERT INTO public.notifications (
        organization_id,
        type,
        title,
        message,
        link
    ) VALUES (
        v_bid.vendor_org_id,
        'bid_accepted',
        'Quotation Accepted!',
        'Your quotation for requirement "' || v_req.title || '" has been accepted. Contact details are now unmasked.',
        '/bids/' || v_bid.id
    );

    -- 10. In-app Notification for Buyer Confirmation
    INSERT INTO public.notifications (
        organization_id,
        type,
        title,
        message,
        link
    ) VALUES (
        v_buyer_org_id,
        'bid_accepted',
        'Bid Awarded Successfully',
        'You accepted the quotation from vendor. You may now create the Purchase Order.',
        '/purchase-orders/new?bid_id=' || v_bid.id
    );

    v_result := jsonb_build_object(
        'success', true,
        'bid_id', p_bid_id,
        'requirement_id', v_req.id,
        'vendor_org_id', v_bid.vendor_org_id,
        'status', 'awarded'
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ATOMIC PURCHASE ORDER CREATION FROM ACCEPTED BID
CREATE OR REPLACE FUNCTION public.create_po_from_bid(
    p_bid_id UUID,
    p_buyer_user_id UUID,
    p_delivery_address TEXT,
    p_delivery_date DATE,
    p_terms TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_bid RECORD;
    v_req RECORD;
    v_po_id UUID;
    v_po_number TEXT;
    v_item RECORD;
BEGIN
    -- 1. Fetch bid
    SELECT * INTO v_bid FROM public.bids WHERE id = p_bid_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bid % does not exist', p_bid_id;
    END IF;

    IF v_bid.status <> 'accepted' THEN
        RAISE EXCEPTION 'Cannot create Purchase Order: Bid % is not in accepted status (current: %)', p_bid_id, v_bid.status;
    END IF;

    -- 2. Check if a PO already exists for this accepted bid
    IF EXISTS (SELECT 1 FROM public.purchase_orders WHERE accepted_bid_id = p_bid_id) THEN
        RAISE EXCEPTION 'A Purchase Order already exists for accepted bid %', p_bid_id;
    END IF;

    -- 3. Fetch requirement
    SELECT * INTO v_req FROM public.requirements WHERE id = v_bid.requirement_id;

    -- 4. Generate unique sequential PO number
    v_po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

    -- 5. Insert PO Header
    INSERT INTO public.purchase_orders (
        po_number,
        buyer_org_id,
        vendor_org_id,
        accepted_bid_id,
        requirement_id,
        subtotal,
        tax,
        total,
        delivery_date,
        delivery_address,
        commercial_terms,
        status,
        issued_at
    ) VALUES (
        v_po_number,
        v_req.buyer_org_id,
        v_bid.vendor_org_id,
        v_bid.id,
        v_req.id,
        v_bid.subtotal,
        v_bid.tax,
        v_bid.total,
        p_delivery_date,
        p_delivery_address,
        COALESCE(p_terms, v_bid.payment_terms || ' | ' || COALESCE(v_bid.delivery_terms, '')),
        'issued',
        NOW()
    ) RETURNING id INTO v_po_id;

    -- 6. Insert PO Line Items from Bid Items
    FOR v_item IN (
        SELECT bi.*, ri.item_name, ri.unit
        FROM public.bid_items bi
        JOIN public.requirement_items ri ON bi.requirement_item_id = ri.id
        WHERE bi.bid_id = p_bid_id
    ) LOOP
        INSERT INTO public.purchase_order_items (
            purchase_order_id,
            requirement_item_id,
            description,
            quantity,
            unit,
            unit_price,
            tax,
            total
        ) VALUES (
            v_po_id,
            v_item.requirement_item_id,
            v_item.item_name || ' (' || COALESCE(v_item.remarks, '') || ')',
            v_item.quantity,
            COALESCE(v_item.unit, 'Nos'),
            v_item.unit_price,
            0.00,
            v_item.total
        );
    END LOOP;

    -- 7. Audit Log
    INSERT INTO public.audit_logs (
        actor_user_id,
        organization_id,
        entity_type,
        entity_id,
        action,
        metadata
    ) VALUES (
        p_buyer_user_id,
        v_req.buyer_org_id,
        'purchase_order',
        v_po_id,
        'create_po',
        jsonb_build_object('po_number', v_po_number, 'bid_id', p_bid_id, 'total', v_bid.total)
    );

    -- 8. Vendor Notification
    INSERT INTO public.notifications (
        organization_id,
        type,
        title,
        message,
        link
    ) VALUES (
        v_bid.vendor_org_id,
        'po_issued',
        'New Purchase Order Issued: ' || v_po_number,
        'A formal purchase order has been generated for requirement "' || v_req.title || '". Please review and accept.',
        '/purchase-orders/' || v_po_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'po_id', v_po_id,
        'po_number', v_po_number,
        'total', v_bid.total,
        'status', 'issued'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PO STATUS LIFECYCLE TRANSITION
CREATE OR REPLACE FUNCTION public.change_po_status(
    p_po_id UUID,
    p_actor_user_id UUID,
    p_new_status TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_po RECORD;
    v_valid_transition BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_po FROM public.purchase_orders WHERE id = p_po_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase Order % does not exist', p_po_id;
    END IF;

    -- Validate allowed status machine transitions:
    -- draft -> issued
    -- issued -> vendor_accepted | vendor_rejected | cancelled
    -- vendor_accepted -> in_production | cancelled
    -- in_production -> dispatched | cancelled
    -- dispatched -> delivered
    -- delivered -> closed
    IF (v_po.status = 'draft' AND p_new_status = 'issued') OR
       (v_po.status = 'issued' AND p_new_status IN ('vendor_accepted', 'vendor_rejected', 'cancelled')) OR
       (v_po.status = 'vendor_accepted' AND p_new_status IN ('in_production', 'cancelled')) OR
       (v_po.status = 'in_production' AND p_new_status IN ('dispatched', 'cancelled')) OR
       (v_po.status = 'dispatched' AND p_new_status IN ('delivered')) OR
       (v_po.status = 'delivered' AND p_new_status IN ('closed')) OR
       (p_new_status = 'cancelled' AND v_po.status NOT IN ('closed', 'cancelled')) THEN
        v_valid_transition := TRUE;
    END IF;

    IF NOT v_valid_transition THEN
        RAISE EXCEPTION 'Invalid PO status transition from % to %', v_po.status, p_new_status;
    END IF;

    UPDATE public.purchase_orders
    SET status = p_new_status, notes = COALESCE(p_notes, notes), updated_at = NOW()
    WHERE id = p_po_id;

    -- Audit log
    INSERT INTO public.audit_logs (
        actor_user_id,
        organization_id,
        entity_type,
        entity_id,
        action,
        metadata
    ) VALUES (
        p_actor_user_id,
        v_po.buyer_org_id,
        'purchase_order',
        p_po_id,
        'change_status',
        jsonb_build_object('from_status', v_po.status, 'to_status', p_new_status, 'notes', p_notes)
    );

    RETURN jsonb_build_object(
        'success', true,
        'po_id', p_po_id,
        'previous_status', v_po.status,
        'new_status', p_new_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
