# Security & Row Level Security (RLS) Architecture

In Manufacturing World, data isolation and contact privacy are treated as mission-critical enterprise security invariants. Security rules are enforced at the database level using PostgreSQL Row Level Security (RLS) and cryptographic access controls, never relying solely on UI masking.

## 1. Threat Model & Isolation Principles

1. **Strict Vendor Bid Isolation**:
   - Competing vendors must NEVER see another vendor's pricing, quotation items, lead times, or commercial terms.
   - Enforced by policy:
     ```sql
     CREATE POLICY bids_select_policy ON public.bids FOR SELECT USING (
         vendor_org_id IN (SELECT org_id FROM public.get_user_org_ids())
         OR requirement_id IN (
             SELECT id FROM public.requirements WHERE buyer_org_id IN (SELECT org_id FROM public.get_user_org_ids())
         )
     );
     ```

2. **Counterparty Contact Privacy & Masking**:
   - Buyer and vendor direct contact details (`email`, `phone`, `address`) remain masked across all pre-award phases (Requirement Published, Bids Submitted, In Review).
   - Only when a buyer executes an official, atomic bid acceptance (`accept_bid`), does the counterparty relationship activate:
     ```sql
     CREATE POLICY contacts_select_policy ON public.organization_contacts FOR SELECT USING (
         organization_id IN (SELECT org_id FROM public.get_user_org_ids())
         OR public.has_accepted_counterparty_relationship(organization_id)
     );
     ```

3. **Atomic Award Transactions**:
   - Handled via `accept_bid(bid_id, user_id)`:
     - Winning bid status transitions to `accepted`.
     - Competing bids transition to `rejected`.
     - Requirement transitions to `awarded`.
     - Immutable audit record generated with timestamp and actor identity.

4. **Purchase Order State Machine Integrity**:
   - PO creation strictly requires an accepted bid and snapshots prices so vendors cannot alter pricing post-award.
   - Enforced state machine: `draft` -> `issued` -> `vendor_accepted`/`vendor_rejected` -> `in_production` -> `dispatched` -> `delivered` -> `closed`.
