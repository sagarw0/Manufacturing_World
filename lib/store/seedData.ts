import { Profile, Organization, OrganizationMember, OrganizationContact, Facility, Machine, Technology, OrganizationTechnology, WorkforceProfile, QualityCertification, Category, Requirement, RequirementItem, RequirementVendor, Bid, BidItem, AuditLog } from "@/types";

export const initialProfiles: Profile[] = [
  {
    id: "33333333-3333-3333-3333-333333333301",
    full_name: "Rajesh Sharma (Buyer Lead)",
    email: "rajesh.sharma@apexmobility.com",
    phone: "+91 98230 11223",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333302",
    full_name: "Vikram Patel (Vendor Admin)",
    email: "vikram.patel@precisiontech.in",
    phone: "+91 98450 44556",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333303",
    full_name: "Arun Kulkarni (Fabrication Head)",
    email: "arun@titanforge.co.in",
    phone: "+91 98110 77889",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const initialOrganizations: Organization[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    legal_name: "Apex Mobility Dynamics Pvt Ltd",
    display_name: "Apex Mobility Dynamics",
    org_type: "buyer",
    description: "Tier-1 Electric Vehicle powertrain and chassis systems manufacturer supplying global OEMs.",
    tax_id: "27AABCA1234F1Z8",
    business_category: "Automotive & Electric Vehicles",
    verification_status: "verified",
    visibility: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    legal_name: "PrecisionTech Engineering Solutions LLP",
    display_name: "PrecisionTech Solutions",
    org_type: "vendor",
    description: "AS9100D certified CNC machining facility with 12 multi-axis centers for aerospace and high-precision automotive components.",
    tax_id: "29AABCP5678Q1Z3",
    business_category: "Precision CNC Machining",
    verification_status: "verified",
    visibility: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    legal_name: "Titan Forge & Heavy Fabrication Works",
    display_name: "Titan Forge & Fabrication",
    org_type: "vendor",
    description: "Heavy sheet metal processing, 6kW laser cutting, robotic welding and powder coating plant.",
    tax_id: "27AABCT9999M1Z5",
    business_category: "Sheet Metal & Heavy Fabrication",
    verification_status: "verified",
    visibility: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const initialMembers: OrganizationMember[] = [
  { id: "om-01", organization_id: "44444444-4444-4444-4444-444444444401", user_id: "33333333-3333-3333-3333-333333333301", role: "buyer", status: "active", created_at: new Date().toISOString() },
  { id: "om-02", organization_id: "44444444-4444-4444-4444-444444444402", user_id: "33333333-3333-3333-3333-333333333302", role: "vendor", status: "active", created_at: new Date().toISOString() },
  { id: "om-03", organization_id: "44444444-4444-4444-4444-444444444403", user_id: "33333333-3333-3333-3333-333333333303", role: "vendor", status: "active", created_at: new Date().toISOString() }
];

export const initialContacts: OrganizationContact[] = [
  { id: "55555555-5555-5555-5555-555555555501", organization_id: "44444444-4444-4444-4444-444444444401", contact_person: "Rajesh Sharma", email: "procurement@apexmobility.com", phone: "+91 20 6789 1234", address_line1: "Plot 42, Chakan Industrial Area, Phase II", city: "Pune", state: "Maharashtra", postal_code: "410501", country: "India", visibility: "counterparties_only", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "55555555-5555-5555-5555-555555555502", organization_id: "44444444-4444-4444-4444-444444444402", contact_person: "Vikram Patel", email: "sales@precisiontech.in", phone: "+91 80 4567 8901", address_line1: "15th Cross, Peenya Industrial Area, 3rd Stage", city: "Bangalore", state: "Karnataka", postal_code: "560058", country: "India", visibility: "counterparties_only", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "55555555-5555-5555-5555-555555555503", organization_id: "44444444-4444-4444-4444-444444444403", contact_person: "Arun Kulkarni", email: "commercial@titanforge.co.in", phone: "+91 22 2580 9000", address_line1: "Survey No 88, Rabale MIDC Industrial Corridor", city: "Navi Mumbai", state: "Maharashtra", postal_code: "400701", country: "India", visibility: "counterparties_only", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const initialFacilities: Facility[] = [
  { id: "66666666-6666-6666-6666-666666666601", organization_id: "44444444-4444-4444-4444-444444444402", name: "Peenya Unit 1 - CNC Machining Complex", address: "Plot 18, 3rd Phase, Peenya Industrial Estate", city: "Bangalore", state: "Karnataka", country: "India", area_sqft: 25000, capacity: "35,000 machining hours/month", operating_hours: "24/7 (3 shifts)", status: "active", created_at: new Date().toISOString() },
  { id: "66666666-6666-6666-6666-666666666602", organization_id: "44444444-4444-4444-4444-444444444403", name: "Rabale Fabrication & Laser Yard", address: "W-12 MIDC Industrial Area, Rabale", city: "Navi Mumbai", state: "Maharashtra", country: "India", area_sqft: 42000, capacity: "250 metric tons steel processing/month", operating_hours: "2 shifts (16 hrs/day)", status: "active", created_at: new Date().toISOString() }
];

export const initialMachines: Machine[] = [
  { id: "m-01", facility_id: "66666666-6666-6666-6666-666666666601", machine_type: "5-Axis Machining Center", make: "Mazak", model: "Variaxis C-600 (X:650 Y:550 Z:510)", quantity: 3, capacity: "18,000 RPM Spindle, +/- 0.005mm accuracy", year_of_manufacture: 2022, certifications: "ISO 10791 Precision Standard", status: "operational", created_at: new Date().toISOString() },
  { id: "m-02", facility_id: "66666666-6666-6666-6666-666666666601", machine_type: "Vertical Machining Center (VMC)", make: "Haas", model: "VF-4SS (X:1270 Y:508 Z:635)", quantity: 5, capacity: "12,000 RPM, 30-tool dual arm ATC", year_of_manufacture: 2021, certifications: "CE Compliant", status: "operational", created_at: new Date().toISOString() },
  { id: "m-03", facility_id: "66666666-6666-6666-6666-666666666602", machine_type: "Fiber Laser Cutting System", make: "Trumpf", model: "TruLaser 3030 Fiber (6kW)", quantity: 2, capacity: "3000 x 1500 mm bed, up to 25mm Mild Steel", year_of_manufacture: 2022, status: "operational", created_at: new Date().toISOString() }
];

export const initialCategories: Category[] = [
  { id: "22222222-2222-2222-2222-222222222201", name: "Precision CNC Machining", description: "Milled and turned metal components", status: "active" },
  { id: "22222222-2222-2222-2222-222222222202", name: "Sheet Metal & Enclosures", description: "Laser cutting, folding, and fabricated chassis", status: "active" },
  { id: "22222222-2222-2222-2222-222222222203", name: "Castings & Forgings", description: "Die castings, investment casting, forgings", status: "active" },
  { id: "22222222-2222-2222-2222-222222222204", name: "Moulded Polymers", description: "Engineering plastic components", status: "active" }
];

export const initialTechnologies: Technology[] = [
  { id: "11111111-1111-1111-1111-111111111101", name: "5-Axis CNC Milling", category: "Machining", description: "Precision simultaneous 5-axis aerospace machining", created_at: new Date().toISOString() },
  { id: "11111111-1111-1111-1111-111111111102", name: "CNC Turning & Live Tooling", category: "Machining", description: "Shafts, flanges with dual spindle turning", created_at: new Date().toISOString() },
  { id: "11111111-1111-1111-1111-111111111103", name: "Fiber Laser Cutting (6kW)", category: "Sheet Metal", description: "Clean cut edges on SS316, aluminum and copper", created_at: new Date().toISOString() },
  { id: "11111111-1111-1111-1111-111111111107", name: "Robotic TIG/MIG Welding", category: "Fabrication", description: "Certified AWS structural and pressure vessel joints", created_at: new Date().toISOString() }
];

export const initialOrgTechnologies: OrganizationTechnology[] = [
  { id: "ot-01", organization_id: "44444444-4444-4444-4444-444444444402", technology_id: "11111111-1111-1111-1111-111111111101", proficiency: "expert", notes: "Titanium and Aluminum 7075-T6 specialist" },
  { id: "ot-02", organization_id: "44444444-4444-4444-4444-444444444402", technology_id: "11111111-1111-1111-1111-111111111102", proficiency: "advanced" },
  { id: "ot-03", organization_id: "44444444-4444-4444-4444-444444444403", technology_id: "11111111-1111-1111-1111-111111111103", proficiency: "expert" }
];

export const initialWorkforce: WorkforceProfile[] = [
  { id: "wf-01", organization_id: "44444444-4444-4444-4444-444444444402", skill_category: "CNC 5-Axis Programmers & Setters", headcount: 14, experience_band: "6-10 yrs", certifications: "Mastercam / Siemens NX", created_at: new Date().toISOString() },
  { id: "wf-02", organization_id: "44444444-4444-4444-4444-444444444402", skill_category: "Quality Assurance & CMM Inspectors", headcount: 8, experience_band: "3-5 yrs", certifications: "Zeiss Calypso CMM Certified", created_at: new Date().toISOString() },
  { id: "wf-03", organization_id: "44444444-4444-4444-4444-444444444403", skill_category: "Certified Robotic Weld Operators", headcount: 22, experience_band: "6-10 yrs", certifications: "AWS D1.1", created_at: new Date().toISOString() }
];

export const initialCertifications: QualityCertification[] = [
  { id: "cert-01", organization_id: "44444444-4444-4444-4444-444444444402", name: "AS9100D Aerospace Quality Management", certificate_no: "AS-9100-2023-8841", issuing_agency: "TUV SUD America", valid_from: "2023-01-15", valid_to: "2026-01-14", status: "verified", created_at: new Date().toISOString() },
  { id: "cert-02", organization_id: "44444444-4444-4444-4444-444444444402", name: "ISO 9001:2015 Quality Management System", certificate_no: "9001-IND-4421", issuing_agency: "BSI Group", valid_from: "2022-06-01", valid_to: "2025-05-31", status: "verified", created_at: new Date().toISOString() },
  { id: "cert-03", organization_id: "44444444-4444-4444-4444-444444444403", name: "ISO 3834-2 Fusion Welding Quality", certificate_no: "WELD-2022-901", issuing_agency: "DNV GL", valid_from: "2022-09-01", valid_to: "2025-08-31", status: "verified", created_at: new Date().toISOString() }
];

export const initialRequirements: Requirement[] = [
  {
    id: "77777777-7777-7777-7777-777777777701",
    buyer_org_id: "44444444-4444-4444-4444-444444444401",
    category_id: "22222222-2222-2222-2222-222222222201",
    title: "Precision CNC Machined EV Motor Housing & Inverter End-Caps",
    description: "High-strength Al 6061-T6 machined housings with O-ring sealing grooves and bearing pockets. Surface finish Ra <= 0.8um with clear anodize.",
    quantity: 500,
    unit: "Sets",
    delivery_location: "Chakan Plant 2, Pune, Maharashtra",
    required_by_date: "2026-11-30",
    deadline: "2026-10-15T18:00:00Z",
    status: "published",
    commercial_terms: "Net 45 Days payment; Door delivery DAP Pune; Material test certificates (MTC) required.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const initialRequirementItems: RequirementItem[] = [
  {
    id: "88888888-8888-8888-8888-888888888801",
    requirement_id: "77777777-7777-7777-7777-777777777701",
    item_name: "EV Motor Stator Housing (5-Axis Machined)",
    specification: "Billet Al 6061-T6, internal spiral cooling jacket, bearing pocket bore concentricity <= 0.010 mm",
    material_grade: "Al 6061-T6",
    tolerance: "+/- 0.015 mm",
    quantity: 500,
    unit: "Nos",
    target_unit_price: 4800.00,
  },
  {
    id: "88888888-8888-8888-8888-888888888802",
    requirement_id: "77777777-7777-7777-7777-777777777701",
    item_name: "Inverter End-Plate with Terminal Bores",
    specification: "Precision turned-milled plate with tapped holes M6x1.0 and hermetic gasket groove",
    material_grade: "Al 6061-T6",
    tolerance: "+/- 0.020 mm",
    quantity: 500,
    unit: "Nos",
    target_unit_price: 1950.00,
  }
];

export const initialRequirementVendors: RequirementVendor[] = [
  { id: "rv-01", requirement_id: "77777777-7777-7777-7777-777777777701", vendor_org_id: "44444444-4444-4444-4444-444444444402", invited_at: new Date().toISOString(), status: "bid_submitted" },
  { id: "rv-02", requirement_id: "77777777-7777-7777-7777-777777777701", vendor_org_id: "44444444-4444-4444-4444-444444444403", invited_at: new Date().toISOString(), status: "invited" }
];

export const initialBids: Bid[] = [
  {
    id: "99999999-9999-9999-9999-999999999901",
    requirement_id: "77777777-7777-7777-7777-777777777701",
    vendor_org_id: "44444444-4444-4444-4444-444444444402",
    version: 1,
    subtotal: 3250000.00,
    tax: 585000.00,
    total: 3835000.00,
    lead_time_days: 28,
    validity_date: "2026-10-31",
    payment_terms: "30% Advance, 70% against dispatch",
    delivery_terms: "DAP Pune Plant 2 Included",
    quality_commitments: "100% CMM inspection report with every batch; Zeiss coordinate measuring report included",
    notes: "First article inspection report (FAIR) available within 10 days of PO issuance",
    status: "submitted",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const initialBidItems: BidItem[] = [
  { id: "bi-01", bid_id: "99999999-9999-9999-9999-999999999901", requirement_item_id: "88888888-8888-8888-8888-888888888801", unit_price: 4650.00, quantity: 500, total: 2325000.00, remarks: "Mazak 5-Axis machined + clear hard anodized" },
  { id: "bi-02", bid_id: "99999999-9999-9999-9999-999999999901", requirement_item_id: "88888888-8888-8888-8888-888888888802", unit_price: 1850.00, quantity: 500, total: 925000.00, remarks: "Doosan turn-milled with deburred chamfers" }
];

export const initialNotifications = [
  {
    id: "notif-01",
    organization_id: "44444444-4444-4444-4444-444444444401",
    type: "bid_submitted",
    title: "New Quotation Received",
    message: "PrecisionTech Solutions submitted a quotation for requirement 'Precision CNC Machined EV Motor Housing & Inverter End-Caps'.",
    link: "/evaluation/77777777-7777-7777-7777-777777777701",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "notif-02",
    organization_id: "44444444-4444-4444-4444-444444444402",
    type: "new_requirement",
    title: "Matching Requirement Available",
    message: "Apex Mobility published a new RFQ matching your 5-Axis CNC Milling capabilities.",
    link: "/requirements/77777777-7777-7777-7777-777777777701",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  }
];
