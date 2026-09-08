import { describe, it, expect } from 'vitest';
import { requirementService } from '../services/requirementService';
import { biddingService } from '../services/biddingService';
import { DocumentAttachment } from '../types/database.types';

describe('Document Attachments in Requirements & Bidding', () => {
  const buyerOrgId = '44444444-4444-4444-4444-444444444401';
  const vendorOrgId = '44444444-4444-4444-4444-444444444402';

  it('allows creating a requirement with multiple drawings, CAD models, and specs', () => {
    const attachments: DocumentAttachment[] = [
      {
        id: 'doc-1',
        name: 'gearbox_casing_drawing.pdf',
        url: 'data:application/pdf;base64,JVBERi0xLjQK...',
        size: 2048000,
        mime_type: 'application/pdf',
        file_category: 'drawing',
        uploaded_at: new Date().toISOString(),
      },
      {
        id: 'doc-2',
        name: 'gearbox_casing_3d.step',
        url: 'data:application/octet-stream;base64,SUdFUy4uLg==',
        size: 5120000,
        mime_type: 'application/octet-stream',
        file_category: 'cad_model',
        uploaded_at: new Date().toISOString(),
      },
      {
        id: 'doc-3',
        name: 'part_preview.png',
        url: 'data:image/png;base64,iVBORw0KGgo...',
        size: 512000,
        mime_type: 'image/png',
        file_category: 'drawing',
        uploaded_at: new Date().toISOString(),
      },
    ];

    const req = requirementService.createRequirement(
      {
        buyer_org_id: buyerOrgId,
        title: 'Precision Gearbox Housing RFQ with CAD',
        description: '5-axis milling with complex internal oil channels',
        quantity: 50,
        unit: 'Sets',
        delivery_location: 'Pune Plant 2',
        required_by_date: '2026-12-30',
        deadline: new Date(Date.now() + 86400000 * 14).toISOString(),
        status: 'published',
      },
      [
        {
          item_name: 'Main Casing',
          specification: 'Billet 7075-T6',
          quantity: 50,
          unit: 'Nos',
          target_unit_price: 12000,
        },
      ],
      attachments
    );

    expect(req.id).toBeDefined();
    expect(req.attachments).toHaveLength(3);
    expect(req.attachments?.[0].name).toBe('gearbox_casing_drawing.pdf');
    expect(req.attachments?.[1].file_category).toBe('cad_model');
    expect(req.attachments?.[2].mime_type).toBe('image/png');

    const fetched = requirementService.getRequirementById(req.id);
    expect(fetched?.attachments).toHaveLength(3);
  });

  it('allows submitting a quotation with attached proposal documents and test certs', () => {
    const requirements = requirementService.getRequirements();
    const req = requirements[0];
    expect(req).toBeDefined();

    const quoteAttachments: DocumentAttachment[] = [
      {
        id: 'quote-doc-1',
        name: 'precisiontech_commercial_quotation.pdf',
        url: 'data:application/pdf;base64,JVBERi0xLjQK...',
        size: 850000,
        mime_type: 'application/pdf',
        file_category: 'quote',
        uploaded_at: new Date().toISOString(),
      },
      {
        id: 'quote-doc-2',
        name: 'mill_test_certificate_mtc31.pdf',
        url: 'data:application/pdf;base64,JVBERi0xLjQK...',
        size: 1200000,
        mime_type: 'application/pdf',
        file_category: 'test_cert',
        uploaded_at: new Date().toISOString(),
      },
    ];

    const items = (req.items || []).map((it) => ({
      requirement_item_id: it.id,
      unit_price: 5400,
      quantity: it.quantity,
      total: 5400 * it.quantity,
      remarks: 'Mazak 5-axis allocated',
    }));

    const subtotal = items.reduce((acc, it) => acc + it.total, 0);

    const bid = biddingService.submitBid({
      requirement_id: req.id,
      vendor_org_id: vendorOrgId,
      subtotal,
      tax: subtotal * 0.18,
      total: subtotal * 1.18,
      lead_time_days: 18,
      validity_date: '2026-12-31',
      payment_terms: 'Net 30',
      delivery_terms: 'DAP Factory Gate',
      quality_commitments: '100% CMM inspection report with MTC 3.1',
      items,
      attachments: quoteAttachments,
    });

    expect(bid.id).toBeDefined();
    expect(bid.attachments).toHaveLength(2);
    expect(bid.attachments?.[0].file_category).toBe('quote');
    expect(bid.attachments?.[1].name).toBe('mill_test_certificate_mtc31.pdf');

    const fetchedBid = biddingService.getBidById(bid.id, vendorOrgId);
    expect(fetchedBid?.attachments).toHaveLength(2);
  });
});
