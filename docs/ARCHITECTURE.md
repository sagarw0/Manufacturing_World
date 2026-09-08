# Manufacturing World — Architecture Blueprint

Manufacturing World is an enterprise B2B manufacturing marketplace facilitating material requirements, RFQs, vendor capability mapping, private competitive quotation bidding, side-by-side bid evaluation, atomic contract award, and end-to-end Purchase Order (PO) lifecycle management.

## 1. High-Level Technology Stack

- **Frontend & App Router**: Next.js 14 / TypeScript / Tailwind CSS / Lucide React
- **Backend & Database**: Supabase PostgreSQL 15+
- **Authentication**: Supabase Auth (`@supabase/ssr`)
- **Document & Asset Storage**: Supabase Storage
- **Security & Authorization**: Row Level Security (RLS) on all 24 public tables
- **Transactions & Stored Procedures**: PL/pgSQL Atomic functions for bid acceptance and PO issuance
- **Testing**: Vitest automated test suite

## 2. Core Modules

```
                        ┌───────────────────────────────┐
                        │       Manufacturing World     │
                        │       Next.js App Router      │
                        └───────────────┬───────────────┘
                                        │
        ┌───────────────────┬───────────┴───────────┬───────────────────┐
        │                   │                       │                   │
┌───────▼───────┐   ┌───────▼───────┐       ┌───────▼───────┐   ┌───────▼───────┐
│ Organizations │   │ Requirements  │       │ Bidding & Bids│   │Purchase Orders│
│& Capabilities │   │   & Line RFQs │       │(Bid Isolation)│   │  (Lifecycle)  │
└───────┬───────┘   └───────┬───────┘       └───────┬───────┘   └───────┬───────┘
        │                   │                       │                   │
        └───────────────────┼───────────────────────┴───────────────────┘
                            │
            ┌───────────────▼───────────────┐
            │     Supabase PostgreSQL       │
            │   (RLS & Privacy Policies)    │
            └───────────────────────────────┘
```

### 2.1 Organization & Capabilities Registry
- **Facilities**: Plant/shop location, floor area, working capacity, operating shift schedules.
- **Machinery**: Complete machine tool registry (e.g. 5-Axis VMC, CNC Lathe, 6kW Fiber Laser, Press Brakes) with make, model, year, and accuracy limits.
- **Technologies & Processes**: Vendor technology mappings with proficiency rating (expert, advanced, intermediate).
- **Workforce Profile**: Aggregated headcounts, experience bands, and certified skill sets (AWS welders, CMM inspectors, CNC programmers).
- **Quality Certifications**: ISO 9001, AS9100D, IATF 16949, ISO 3834 with verification statuses.

### 2.2 Requirement Publishing & Eligibility
- Material grade, tight tolerances, quantity, delivery locations, deadline.
- Automatic matchmaking of eligible vendors based on equipment category and production capability.

### 2.3 Bidding & Strict Bid Isolation
- Each vendor submits private line-item rates, taxes, lead times, delivery terms, and quality commitments.
- Competing vendors have zero visibility into other vendors' quotations.

### 2.4 Atomic Acceptance & Contact Unmasking
- Atomic transaction (`accept_bid`): Awarding the selected bid simultaneously rejects competing quotes and marks the requirement as awarded.
- Contact Privacy Masking: Buyer and vendor direct contact details (email, phone, exact address) are masked at the database and API level until bid acceptance.

### 2.5 Purchase Order Lifecycle
- One-click PO generation directly snapshots accepted bid pricing and line items.
- Full state machine: `Issued` -> `Vendor Accepted` -> `In Production` -> `Dispatched` -> `Delivered` -> `Closed`.
