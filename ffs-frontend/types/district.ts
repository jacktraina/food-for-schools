import { Address, SchoolDetails } from './school';

export interface District {
  id: number;
  name?: string;
  location?: string;
  schools: number;
  students: number;
  status?: string;
}

export interface CreateDistrictPayload {
  name: string;
  location?: string;
  directorName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
  enrollment?: number;
  raNumber?: string;
  contact2?: string;
  contact2Phone?: string;
  contact2Email?: string;
  billingContact?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingPhone?: string;
  billingEmail?: string;
  superintendent?: string;
  established?: string;
  status?: string;
  budget?: string;
  schools?: number;
  students?: number;
  participatingIn?: string[];
  products?: string[];
}

export interface CreateDistrictResponse {
  id: number;
  name: string;
}

export interface UpdateDistrictPayload {
  name?: string;
  location?: string;
  directorName?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
  districtEnrollment?: number;
  raNumber?: string;
  numberOfSchools?: number;
  numberOfStudents?: number;
  annualBudget?: number;
  secondaryContactName?: string;
  secondaryContactPhone?: string;
  secondaryContactEmail?: string;
  superintendentName?: string;
  establishedYear?: number;
  billingContactName?: string;
  billingContactStreetAddress1?: string;
  billingContactStreetAddress2?: string;
  billingContactCity?: string;
  billingContactState?: string;
  billingContactZipCode?: string;
  billingContactPhone?: string;
  billingContactEmail?: string;
  products?: string[];
  isDelete?: boolean;
}

export interface MutateDistrictResponse {
  id: number;
  name: string;
}

export interface DistrictResponse {
  id: number;
  organization_id?: number;
  name: string;
  location?: string;
  website?: string;
  superintendent_name?: string;
  established_year?: number;
  created_at?: Date | string;
  is_deleted?: boolean;
  total_schools?: number;
  total_students?: number;
  annual_budget?: number;
  director_name?: string;
  phone?: string;
  email?: string;
  fax?: string;
  district_enrollment?: number;
  ra_number?: string;
  address?: Address;
  secondary_contact_name?: string;
  secondary_contact_phone?: string;
  secondary_contact_email?: string;
  billing_contact_name?: string;
  billing_contact_phone?: string;
  billing_contact_email?: string;
  billing_address?: Address;
  logo_url?: string;
  products?: string[];
  schools?: SchoolDetails[];
}
