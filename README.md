# Manufacturing World — B2B Manufacturing Marketplace & Purchase Order Engine

> **Web marketplace for manufacturers, vendors, requirements, bidding, quotations, and purchase orders.**

Manufacturing World connects industrial buyers and manufacturing vendors. Vendors build comprehensive shop profiles detailing factory locations, machinery registries, manufacturing technologies, and skilled workforce certifications. Buyers publish raw-material and precision component requirements. Eligible vendors submit private, competitive quotations. Buyers evaluate quotations through a side-by-side comparison matrix and execute an atomic award transaction, automatically revealing counterparty contact details and issuing formal Purchase Orders with full lifecycle tracking.

---

## 🚀 Key Features & Highlights

1. **Role-Based Workflows**:
   - **Buyer**: Create requirements (RFQs), set tolerances & CAD drawing specs, review incoming bids, compare quotations, accept winning bids, and issue Purchase Orders.
   - **Vendor**: Register shop machinery (5-Axis CNC, Laser Cutting, Press Brakes), map technology proficiencies, submit private itemized quotations, revise bids before deadlines, and fulfill POs.
   - **Buyer + Vendor**: Registered enterprise organizations capable of performing both procurement and manufacturing fulfillment.
   - **Super Admin**: Organization moderation, verification badge approval, and immutable security audit logs.

2. **Strict Vendor Bid Isolation**:
   - Competing vendors can **never** view another vendor's bids, prices, lead times, or commercial terms.
   - Enforced by Row Level Security (RLS) policies in Supabase PostgreSQL.

3. **Cryptographic Contact Privacy & Masking**:
   - Buyer and vendor direct contact details (email, phone, factory street address) remain masked across pre-award stages.
   - Contact unmasking occurs atomically **only** when a buyer accepts the vendor's quotation or an active Purchase Order exists.

4. **Atomic Bid Acceptance & PO Generation**:
   - One-click contract award atomically updates the winning bid to `accepted`, marks all competing quotes as `rejected`, updates the requirement status to `awarded`, and registers immutable audit trail records.
   - One-click PO generation snapshots agreed prices, generates a sequential identifier (`PO-YYYYMMDD-XXXX`), and begins the fulfillment lifecycle (`Issued` → `Vendor Accepted` → `In Production` → `Dispatched` → `Delivered` → `Closed`).

---

## 🏗️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend & Database**: Supabase PostgreSQL 15+, Supabase Auth, Supabase Storage
- **Security**: PostgreSQL Row Level Security (RLS) on all 24 tables
- **Testing**: Vitest automated test suite for bid isolation, contact privacy, atomic awards, and PO lifecycle

---

## 📁 Repository Structure

```
Manufacturing_World/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                           # Main Dashboard & Live Marketplace
│   │   ├── requirements/
│   │   │   ├── page.tsx                       # RFQ Listing & Status Filtering
│   │   │   ├── new/page.tsx                   # Multi-item Requirement Authoring
│   │   │   └── [id]/page.tsx                  # Requirement Detail & Bidding Modal
│   │   ├── bids/
│   │   │   ├── page.tsx                       # Isolated Quotations Listing
│   │   │   └── [id]/page.tsx                  # Quotation Breakdown & Version History
│   │   ├── evaluation/
│   │   │   └── [requirementId]/page.tsx       # Side-by-side Bid Comparison & Award
│   │   ├── purchase-orders/
│   │   │   ├── page.tsx                       # Purchase Orders Index
│   │   │   ├── new/page.tsx                   # Generate PO from Accepted Bid
│   │   │   └── [id]/page.tsx                  # Printable PO & Lifecycle Stepper
│   │   ├── organizations/
│   │   │   └── capabilities/page.tsx          # Facilities, Machines, Tech & Workforce
│   │   └── admin/
│   │       └── page.tsx                       # Moderation Queue & Audit Log Trail
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── common/
│   │   ├── StatusBadge.tsx                    # Multi-status colored badge
│   │   └── MaskedContactCard.tsx              # Dynamic privacy masking card
│   └── layout/
│       ├── Navbar.tsx                         # Header with Interactive Persona Switcher
│       └── Sidebar.tsx                        # Module Navigation
├── lib/
│   ├── privacy/
│   │   └── contactMasker.ts                   # Privacy and Masking Utility
│   ├── store/
│   │   ├── mockStore.ts                       # Reactive Local State Engine
│   │   └── seedData.ts                        # Realistic Manufacturing Seed Data
│   ├── supabase/
│   │   └── client.ts                          # Supabase Client Wrapper
│   └── utils.ts                               # Currency & Date Formatters
├── services/
│   ├── organizationService.ts
│   ├── requirementService.ts
│   ├── biddingService.ts
│   └── poService.ts
├── supabase/
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql           # 24 Core PostgreSQL Tables & Indexes
│   │   ├── 00002_rls_policies.sql             # RLS Policies & Privacy Helper Functions
│   │   ├── 00003_atomic_functions.sql         # accept_bid, create_po, change_po_status
│   │   └── 00004_seed_data.sql                # Production Seed Data
│   └── seed.sql
├── tests/
│   ├── bid_isolation.test.ts                  # Bid confidentiality assertions
│   ├── contact_masking.test.ts                # Obfuscation & unmasking tests
│   ├── atomic_acceptance.test.ts              # Award transaction verification
│   └── po_lifecycle.test.ts                   # State machine progression tests
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SECURITY_RLS.md
│   └── ERD.md
├── .env.example
├── package.json
└── README.md
```

---

## 🧪 Running Automated Tests

Run the full Vitest test suite:

```bash
npm run test
```

All 11 automated security and domain tests will execute:
- `tests/bid_isolation.test.ts`: Verifies competitor bids cannot be viewed by other vendors.
- `tests/contact_masking.test.ts`: Asserts email, phone, and address masking prior to bid award.
- `tests/atomic_acceptance.test.ts`: Verifies simultaneous bid acceptance, competitor rejection, and requirement status transition.
- `tests/po_lifecycle.test.ts`: Validates sequential PO number generation, line-item copying, and fulfillment state progression.

---

## 💻 Running the Application Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Interactive Persona Switcher**:
   Use the **Active Persona** selector in the top navbar to instantly test:
   - **Apex Mobility Dynamics (Buyer)**: Post requirements, review incoming bids, compare quotations, accept bids, and issue POs.
   - **PrecisionTech Solutions (Vendor - CNC)**: View shop machinery, browse eligible requirements, and submit/revise private bids.
   - **Titan Forge Works (Vendor - Fabrication)**: View competitor isolation and test independent bidding.

---

## 🔐 Database & Supabase Deployment

Run the version-controlled SQL migrations in sequence against your Supabase instance:
1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_rls_policies.sql`
3. `supabase/migrations/00003_atomic_functions.sql`
4. `supabase/migrations/00004_seed_data.sql`

---

## 📦 GitHub Repository

- **Repository**: `Manufacturing_World`
- **Owner ID**: `sagarw0`
- **Remote URL**: `https://github.com/sagarw0/Manufacturing_World.git`
