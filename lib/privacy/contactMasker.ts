import { ContactInfo, OrganizationContact } from "@/types";

/**
 * Mask an email address: e.g. "procurement@apexmobility.com" -> "p**********@apexmobility.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "masked@privacy.protected";
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  const maskedUser = user[0] + "*".repeat(Math.max(user.length - 2, 4)) + user[user.length - 1];
  return `${maskedUser}@${domain}`;
}

/**
 * Mask a phone number: e.g. "+91 98230 11223" -> "+91 98*****223"
 */
export function maskPhone(phone: string): string {
  if (!phone) return "+91 ******0000";
  const cleaned = phone.trim();
  if (cleaned.length <= 6) return "******";
  const visiblePrefix = cleaned.slice(0, 5);
  const visibleSuffix = cleaned.slice(-3);
  return `${visiblePrefix}******${visibleSuffix}`;
}

/**
 * Mask a street address while keeping regional jurisdiction (city, state, country)
 */
export function maskAddress(address: string, city: string, state: string, country: string): string {
  return `[Protected Facility Address], ${city}, ${state}, ${country}`;
}

/**
 * Applies strict counterparty authorization to determine if contacts should be revealed or masked.
 * Contact details remain masked until:
 * 1. The viewer belongs to the target organization, OR
 * 2. An accepted bid or issued/active PO exists between the viewer's org and the target org.
 */
export function resolveContactPrivacy(
  contact: OrganizationContact | null | undefined,
  isAuthorizedCounterparty: boolean
): ContactInfo {
  if (!contact) {
    return {
      contact_person: "Authorized Representative",
      email: "masked@privacy.protected",
      phone: "+91 ******0000",
      address: "Industrial Area",
      city: "Manufacturing Hub",
      state: "State",
      country: "India",
      isMasked: true,
    };
  }

  if (isAuthorizedCounterparty) {
    return {
      contact_person: contact.contact_person,
      email: contact.email,
      phone: contact.phone,
      address: `${contact.address_line1}${contact.address_line2 ? ', ' + contact.address_line2 : ''}`,
      city: contact.city,
      state: contact.state,
      country: contact.country,
      isMasked: false,
    };
  }

  return {
    contact_person: `${contact.contact_person.split(" ")[0]} [Verified Counterparty Contact]`,
    email: maskEmail(contact.email),
    phone: maskPhone(contact.phone),
    address: maskAddress(contact.address_line1, contact.city, contact.state, contact.country),
    city: contact.city,
    state: contact.state,
    country: contact.country,
    isMasked: true,
  };
}
