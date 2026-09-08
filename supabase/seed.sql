-- ====================================================================
-- Manufacturing World: Seed Data
-- Migration: 00004_seed_data.sql
-- ====================================================================

-- 1. TECHNOLOGIES
INSERT INTO public.technologies (id, name, category, description) VALUES
('11111111-1111-1111-1111-111111111101', '5-Axis CNC Milling', 'Machining', 'High-precision multi-axis simultaneous contouring for complex aerospace & automotive parts'),
('11111111-1111-1111-1111-111111111102', 'CNC Turning & Turn-Mill', 'Machining', 'Precision cylindrical components with live tooling capabilities'),
('11111111-1111-1111-1111-111111111103', 'Fiber Laser Cutting (6kW+)', 'Sheet Metal', 'High-speed flatbed laser cutting for mild steel, SS316, and aluminum up to 25mm'),
('11111111-1111-1111-1111-111111111104', 'CNC Press Brake Bending', 'Sheet Metal', 'High accuracy hydraulic multi-axis sheet metal folding and forming'),
('11111111-1111-1111-1111-111111111105', 'Aluminum High Pressure Die Casting', 'Casting', 'Automated HPDC cell with robotic ladling for automotive housings'),
('11111111-1111-1111-1111-111111111106', 'Precision Plastic Injection Moulding', 'Moulding', 'Micro-tolerance moulding using engineering thermoplastics (PEEK, Nylon, POM)'),
('11111111-1111-1111-1111-111111111107', 'Robotic TIG/MIG Welding', 'Fabrication', 'Consistent structural joints with certified weld inspectors (AWS/ISO 3834)'),
('11111111-1111-1111-1111-111111111108', 'Hard Anodizing (Type III)', 'Surface Treatment', 'MIL-A-8625 compliance 50 micron surface passivation for aerospace aluminum')
ON CONFLICT (name) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO public.categories (id, name, description) VALUES
('22222222-2222-2222-2222-222222222201', 'Precision CNC Machining', 'Milled, turned, and ground metallic components'),
('22222222-2222-2222-2222-222222222202', 'Sheet Metal & Enclosures', 'Laser cut, folded, punched and welded electrical/mechanical enclosures'),
('22222222-2222-2222-2222-222222222203', 'Castings & Forgings', 'Ferrous and non-ferrous cast parts, die castings, and forgings'),
('22222222-2222-2222-2222-222222222204', 'Moulded Polymers & Composites', 'Injection moulded precision engineering plastics and silicone seals')
ON CONFLICT (name) DO NOTHING;

-- 3. PROFILES
INSERT INTO public.profiles (id, auth_user_id, full_name, email, phone, status) VALUES
('33333333-3333-3333-3333-333333333301', 'a0000000-0000-0000-0000-000000000001', 'Rajesh Sharma (Buyer Lead)', 'rajesh.sharma@apexmobility.com', '+91 98230 11223', 'active'),
('33333333-3333-3333-3333-333333333302', 'a0000000-0000-0000-0000-000000000002', 'Vikram Patel (Vendor Admin)', 'vikram.patel@precisiontech.in', '+91 98450 44556', 'active'),
('33333333-3333-3333-3333-333333333303', 'a0000000-0000-0000-0000-000000000003', 'Arun Kulkarni (Fabrication Head)', 'arun@titanforge.co.in', '+91 98110 77889', 'active'),
('33333333-3333-3333-3333-333333333304', 'a0000000-0000-0000-0000-000000000004', 'Platform Super Admin', 'superadmin@mfgworld.io', '+91 90000 00001', 'active')
ON CONFLICT (email) DO NOTHING;

-- 4. ORGANIZATIONS
INSERT INTO public.organizations (id, legal_name, display_name, org_type, description, tax_id, verification_status) VALUES
('44444444-4444-4444-4444-444444444401', 'Apex Mobility Dynamics Pvt Ltd', 'Apex Mobility', 'buyer', 'Tier-1 Electric Vehicle powertrain and chassis systems manufacturer', '27AABCA1234F1Z8', 'verified'),
('44444444-4444-4444-4444-444444444402', 'PrecisionTech Engineering Solutions LLP', 'PrecisionTech Solutions', 'vendor', 'AS9100D certified CNC machining facility with 12 multi-axis centers', '29AABCP5678Q1Z3', 'verified'),
('44444444-4444-4444-4444-444444444403', 'Titan Forge & Heavy Fabrication Works', 'Titan Forge Works', 'vendor', 'ISO 3834 heavy sheet metal processing, laser cutting & robotic welding', '27AABCT9999M1Z5', 'verified')
ON CONFLICT (id) DO NOTHING;

-- 5. ORGANIZATION CONTACTS (PROTECTED SENSITIVE DATA)
INSERT INTO public.organization_contacts (id, organization_id, contact_person, email, phone, address_line1, city, state, postal_code, country) VALUES
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'Rajesh Sharma', 'procurement@apexmobility.com', '+91 20 6789 1234', 'Plot 42, Chakan Industrial Area, Phase II', 'Pune', 'Maharashtra', '410501', 'India'),
('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444402', 'Vikram Patel', 'sales@precisiontech.in', '+91 80 4567 8901', '15th Cross, Peenya Industrial Area, 3rd Stage', 'Bangalore', 'Karnataka', '560058', 'India'),
('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444403', 'Arun Kulkarni', 'commercial@titanforge.co.in', '+91 22 2580 9000', 'Survey No 88, Rabale MIDC Industrial Corridor', 'Navi Mumbai', 'Maharashtra', '400701', 'India')
ON CONFLICT (id) DO NOTHING;

-- 6. ORGANIZATION MEMBERS
INSERT INTO public.organization_members (organization_id, user_id, role, status) VALUES
('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333301', 'buyer', 'active'),
('44444444-4444-4444-4444-444444444402', '33333333-3333-3333-3333-333333333302', 'vendor', 'active'),
('44444444-4444-4444-4444-444444444403', '33333333-3333-3333-3333-333333333303', 'vendor', 'active')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 7. FACILITIES & MACHINES (VENDOR PROFILE)
INSERT INTO public.facilities (id, organization_id, name, address, city, state, area_sqft, capacity, status) VALUES
('66666666-6666-6666-6666-666666666601', '44444444-4444-4444-4444-444444444402', 'Peenya Unit 1 - CNC Complex', 'Plot 18, 3rd Phase, Peenya', 'Bangalore', 'Karnataka', 25000, '35,000 machining hours/month', 'active'),
('66666666-6666-6666-6666-666666666602', '44444444-4444-4444-4444-444444444403', 'Rabale Fabrication Yard', 'W-12 MIDC Rabale', 'Navi Mumbai', 'Maharashtra', 42000, '250 metric tons/month', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.machines (facility_id, machine_type, make, model, quantity, capacity, year_of_manufacture, status) VALUES
('66666666-6666-6666-6666-666666666601', '5-Axis Machining Center', 'Mazak', 'Variaxis C-600 (X:650 Y:550 Z:510)', 3, '18,000 RPM Spindle', 2022, 'operational'),
('66666666-6666-6666-6666-666666666601', 'Vertical Machining Center', 'Haas', 'VF-4SS (X:1270 Y:508 Z:635)', 5, '12,000 RPM', 2021, 'operational'),
('66666666-6666-6666-6666-666666666601', 'CNC Turning Center', 'Doosan', 'Lynx 2100LSYB (Sub-spindle & Y-axis)', 4, 'Bar 65mm, Chuck 8"', 2023, 'operational'),
('66666666-6666-6666-6666-666666666602', 'Fiber Laser Cutter', 'Trumpf', 'TruLaser 3030 Fiber (6kW)', 2, '3000 x 1500 mm Bed', 2022, 'operational'),
('66666666-6666-6666-6666-666666666602', 'CNC Hydraulic Press Brake', 'Amada', 'HRB 1003 (100-ton)', 3, '3100 mm Bend Length', 2020, 'operational')
ON CONFLICT DO NOTHING;

-- 8. VENDOR TECHNOLOGIES & WORKFORCE
INSERT INTO public.organization_technologies (organization_id, technology_id, proficiency, notes) VALUES
('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111101', 'expert', 'Extensive experience with Titanium, Inconel and Aluminum 7075-T6'),
('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111102', 'advanced', 'High volume shaft turn-milling with sub-spindle cycle integration'),
('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111103', 'expert', 'Nitrogen-assist clean edge cutting on SS304/SS316'),
('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111107', 'advanced', 'Robotic welding cells for battery pack structural trays')
ON CONFLICT (organization_id, technology_id) DO NOTHING;

INSERT INTO public.workforce_profiles (organization_id, skill_category, headcount, experience_band, certifications) VALUES
('44444444-4444-4444-4444-444444444402', 'CNC 5-Axis Programmers & Setters', 14, '6-10 yrs', 'Mastercam / NX Certified'),
('44444444-4444-4444-4444-444444444402', 'Quality Control / CMM Inspectors', 8, '3-5 yrs', 'Zeiss Calypso CMM Certified'),
('44444444-4444-4444-4444-444444444403', 'Certified Robotic Weld Operators', 22, '6-10 yrs', 'AWS D1.1 / EN 287-1'),
('44444444-4444-4444-4444-444444444403', 'Sheet Metal DFM Engineers', 6, '3-5 yrs', 'SolidWorks SheetMetal')
ON CONFLICT DO NOTHING;

-- 9. CERTIFICATIONS
INSERT INTO public.quality_certifications (organization_id, name, certificate_no, issuing_agency, valid_from, valid_to, status) VALUES
('44444444-4444-4444-4444-444444444402', 'AS9100D Aerospace Quality Management', 'AS-9100-2023-8841', 'TUV SUD America', '2023-01-15', '2026-01-14', 'verified'),
('44444444-4444-4444-4444-444444444402', 'ISO 9001:2015 Quality Management System', '9001-IND-4421', 'BSI Group', '2022-06-01', '2025-05-31', 'verified'),
('44444444-4444-4444-4444-444444444403', 'ISO 3834-2 Comprehensive Quality Welding', 'WELD-2022-901', 'DNV GL', '2022-09-01', '2025-08-31', 'verified')
ON CONFLICT DO NOTHING;

-- 10. SAMPLE REQUIREMENT WITH ITEMS & ELIGIBILITY
INSERT INTO public.requirements (id, buyer_org_id, category_id, title, description, quantity, unit, delivery_location, required_by_date, deadline, status, commercial_terms) VALUES
('77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', 'Precision CNC Machined EV Motor Housing & Inverter End-Caps', 'High-strength Al 6061-T6 machined housings with O-ring sealing grooves and bearing pockets. Surface finish Ra <= 0.8um with clear anodize.', 500, 'Sets', 'Chakan Plant 2, Pune', '2026-11-30', '2026-10-15 18:00:00+05:30', 'published', 'Net 45 Days payment; Door delivery DAP Pune; Material test certificates (MTC) required')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.requirement_items (id, requirement_id, item_name, specification, material_grade, tolerance, quantity, unit, target_unit_price) VALUES
('88888888-8888-8888-8888-888888888801', '77777777-7777-7777-7777-777777777701', 'EV Motor Stator Housing (Machined)', 'Billet Al 6061-T6, 5-Axis contouring, internal cooling jacket passages', 'Al 6061-T6', '+/- 0.015 mm', 500, 'Nos', 4800.00),
('88888888-8888-8888-8888-888888888802', '77777777-7777-7777-7777-777777777701', 'Inverter End-Plate with Terminal Bores', 'Precision turned-milled plate with tapped holes M6x1.0 and hermetic gasket groove', 'Al 6061-T6', '+/- 0.020 mm', 500, 'Nos', 1950.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.requirement_vendors (requirement_id, vendor_org_id, invited_at, status) VALUES
('77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444402', NOW(), 'bid_submitted'),
('77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444403', NOW(), 'invited')
ON CONFLICT (requirement_id, vendor_org_id) DO NOTHING;

-- 11. SAMPLE BID FROM PRECISIONTECH (SUBMITTED)
INSERT INTO public.bids (id, requirement_id, vendor_org_id, version, subtotal, tax, total, lead_time_days, validity_date, payment_terms, delivery_terms, quality_commitments, notes, status) VALUES
('99999999-9999-9999-9999-999999999901', '77777777-7777-7777-7777-777777777701', '44444444-4444-4444-4444-444444444402', 1, 3250000.00, 585000.00, 3835000.00, 28, '2026-10-31', '30% Advance, 70% against dispatch', 'DAP Pune Included', '100% CMM inspection report with every batch; Zeiss coordinate measuring report included', 'First article inspection report (FAIR) available within 10 days of PO issuance', 'submitted')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bid_items (bid_id, requirement_item_id, unit_price, quantity, total, remarks) VALUES
('99999999-9999-9999-9999-999999999901', '88888888-8888-8888-8888-888888888801', 4650.00, 500, 2325000.00, 'Mazak 5-Axis machined + clear hard anodized'),
('99999999-9999-9999-9999-999999999901', '88888888-8888-8888-8888-888888888802', 1850.00, 500, 925000.00, 'Doosan turn-milled with deburred chamfers')
ON CONFLICT DO NOTHING;
