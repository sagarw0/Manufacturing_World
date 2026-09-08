export * from "./database.types";

export interface ContactInfo {
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  isMasked: boolean;
}
