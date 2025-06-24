export interface School {
  id: number;
  name: string;
  enrollment?: number;
  school_type: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  district_id: number;
}

export interface SchoolDetails {
  id: number;
  name: string;
  enrollment?: number;
  school_type: string;
  shipping_address: string;
  contact_first_name: string;
  contact_last_name: string;
  status: string;
}

export interface Address {
  street_address_1?: string;
  street_address_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface GetSchoolResponse {
  id: number;
  districtId: number;
  name: string;
  enrollment?: number;
  schoolType: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingAddressCity?: string;
  shippingAddressState?: string;
  shippingAddressZipCode?: string;
  notes?: string;
  phone?: string;
  email?: string;
  overrideDistrictBilling: boolean;
  status: string;
  createdAt: Date;
  code?: string;
  location?: string;
  directorName?: string;
  website?: string;
  description?: string;
  logo?: string;
  fullAddress: string;
  shippingFullAddress: string;
}

export interface GetSchoolDetailsResponse {
  id: number;
  districtId: number;
  districtName: string;
  name?: string;
  enrollment?: number;
  schoolType?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingAddressCity?: string;
  shippingAddressState?: string;
  shippingAddressZipCode?: string;
  notes?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactTitle?: string;
  contactPhone?: string;
  contactEmail?: string;
  billingContact?: string;
  billingPhone?: string;
  billingEmail?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  fax?: string;
  shippingInstructions?: string;
  shippingDeliveryHours?: string;
  override_district_billing?: boolean;
}
