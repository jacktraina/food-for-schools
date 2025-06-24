export interface GetDistrictResponse {
  id: number;
  organization_id?: number | null;
  name: string;
  location?: string | null;
  website?: string | null;
  superintendent_name?: string | null;
  established_year?: number | null;
  created_at?: Date | string | null;
  is_deleted?: boolean | null;

  total_schools?: number | null;
  total_students?: number | null;
  annual_budget?: number | null;
  director_name?: string | null;
  phone?: string | null;
  email?: string | null;
  fax?: string | null;
  district_enrollment?: number | null;
  ra_number?: string | null;

  address?: Address | null;
  secondary_contact_name?: string | null;
  secondary_contact_phone?: string | null;
  secondary_contact_email?: string | null;
  billing_contact_name?: string | null;
  billing_contact_phone?: string | null;
  billing_contact_email?: string | null;
  billing_address?: Address | null;

  shipping_address?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  status?: string | null;

  products?: string[] | null;
  schools?: School[] | null;
}

export interface Address {
  street_address_1: string | null;
  street_address_2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
}

export interface School {
  id: number;
  name: string;
  enrollment: number | null;
  school_type: string;
  shipping_address?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  status?: string | null;
}

