import { describe, it, expect } from "vitest";
import { maskEmail, maskPhone, maskAddress, resolveContactPrivacy } from "../lib/privacy/contactMasker";

describe("Contact Privacy & Masking Rules", () => {
  it("Masks email address properly prior to acceptance", () => {
    const masked = maskEmail("rajesh.sharma@apexmobility.com");
    expect(masked).not.toContain("rajesh.sharma");
    expect(masked).toContain("@apexmobility.com");
    expect(masked.startsWith("r")).toBe(true);
  });

  it("Masks phone number properly prior to acceptance", () => {
    const masked = maskPhone("+91 98230 11223");
    expect(masked).toContain("******");
    expect(masked).not.toBe("+91 98230 11223");
  });

  it("Masks physical street address while maintaining city and state jurisdiction", () => {
    const masked = maskAddress("Plot 42, Chakan Industrial Area", "Pune", "Maharashtra", "India");
    expect(masked).toContain("Pune");
    expect(masked).toContain("Maharashtra");
    expect(masked).not.toContain("Plot 42");
  });

  it("resolveContactPrivacy unmasks contact ONLY when counterparty relationship is authorized", () => {
    const sampleContact = {
      id: "c-01",
      organization_id: "org-01",
      contact_person: "Rajesh Sharma",
      email: "procurement@apexmobility.com",
      phone: "+91 20 6789 1234",
      address_line1: "Plot 42 Chakan MIDC",
      city: "Pune",
      state: "Maharashtra",
      postal_code: "410501",
      country: "India",
      visibility: "counterparties_only" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const maskedResult = resolveContactPrivacy(sampleContact, false);
    expect(maskedResult.isMasked).toBe(true);
    expect(maskedResult.email).toContain("*");
    expect(maskedResult.phone).toContain("*");

    const unmaskedResult = resolveContactPrivacy(sampleContact, true);
    expect(unmaskedResult.isMasked).toBe(false);
    expect(unmaskedResult.email).toBe("procurement@apexmobility.com");
    expect(unmaskedResult.phone).toBe("+91 20 6789 1234");
    expect(unmaskedResult.address).toContain("Plot 42 Chakan MIDC");
  });
});
