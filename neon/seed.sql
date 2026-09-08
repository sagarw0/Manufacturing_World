-- Manufacturing World: Seed Data for Neon Serverless PostgreSQL

-- 1. Profiles
INSERT INTO profiles (id, full_name, email, phone, status) VALUES
('33333333-3333-3333-3333-333333333301', 'Vikram Malhotra', 'procurement@apexmobility.com', '+91 98230 11223', 'active'),
('33333333-3333-3333-3333-333333333302', 'Sunil Deshmukh', 'estimating@precisiontech.co.in', '+91 98901 44556', 'active'),
('33333333-3333-3333-3333-333333333303', 'Rajesh Gupta', 'commercials@titanforge.com', '+91 97654 77889', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Organizations
INSERT INTO organizations (id, legal_name, display_name, org_type, description, verification_status, visibility) VALUES
('44444444-4444-4444-4444-444444444401', 'Apex Mobility Systems Ltd', 'Apex Mobility', 'buyer', 'Tier-1 automotive powertrain and sub-assembly manufacturer for global OEMs.', 'verified', 'public'),
('44444444-4444-4444-4444-444444444402', 'PrecisionTech CNC Solutions Pvt Ltd', 'PrecisionTech Solutions', 'vendor', 'High precision 5-axis CNC milling, turning, and aerospace aluminum components.', 'verified', 'public'),
('44444444-4444-4444-4444-444444444403', 'Titan Forge & Fabrication LLP', 'Titan Forge Works', 'vendor', 'Heavy structural fabrication, laser cutting, and robotic welding facility.', 'verified', 'public')
ON CONFLICT (id) DO NOTHING;

-- 3. Categories
INSERT INTO categories (id, name, description) VALUES
('22222222-2222-2222-2222-222222222201', 'CNC Precision Machining', '5-axis milling, Swiss turning, EDM wire cutting, close-tolerance parts'),
('22222222-2222-2222-2222-222222222202', 'Sheet Metal & Fabrication', 'Fiber laser cutting, CNC bending, TIG/MIG robotic welding, stamping')
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Requirement with Drawings
INSERT INTO requirements (id, buyer_org_id, category_id, title, description, quantity, unit, delivery_location, required_by_date, deadline, status, commercial_terms) VALUES
('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', 'Machined EV Motor Housing (Al 7075-T6)', 'Precision CNC milled motor end-bell housing for high-performance EV drivetrain. Tight concentricity and bore tolerances required.', 250, 'Nos', 'Chakan Industrial Zone, Pune, Maharashtra', '2026-12-15', NOW() + INTERVAL '30 days', 'published', 'Payment Net 30 days after inspection. Delivery required at Chakan plant. MTC 3.1 mandatory with each batch.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO requirement_items (id, requirement_id, item_name, specification, material_grade, tolerance, quantity, unit, target_unit_price) VALUES
('66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555501', 'Drive-End Flange Housing', '5-Axis CNC machined with integral cooling channels. Hard clear anodized 25 microns.', 'Al 7075-T6', '+/- 0.010 mm', 250, 'Nos', 5500.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO requirement_attachments (id, requirement_id, name, url, size_bytes, mime_type, file_category) VALUES
('77777777-7777-7777-7777-777777777701', '55555555-5555-5555-5555-555555555501', 'housing_2d_print_revC.pdf', 'https://raw.githubusercontent.com/sagarw0/Manufacturing_World/main/public/sample_drawing.pdf', 1452000, 'application/pdf', 'drawing'),
('77777777-7777-7777-7777-777777777702', '55555555-5555-5555-5555-555555555501', 'motor_housing_3d_step.step', 'https://raw.githubusercontent.com/sagarw0/Manufacturing_World/main/public/sample_model.step', 4890000, 'application/octet-stream', 'cad_model')
ON CONFLICT (id) DO NOTHING;
