import { School } from '../../domain/interfaces/Schools/School';
import { GetSchoolDetailsResponse } from '../../interfaces/responses/schools/GetSchoolDetailsResponse';

export interface ISchoolService {
  createSchool(
    districtId: number,
    schoolData: {
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
      schoolContactName?: string;
      schoolContactPhone?: string;
      schoolContactEmail?: string;
      notes?: string;
      overrideDistrictBilling: boolean;
    },
    userId: number
  ): Promise<School>;

  getSchoolsByDistrictId(
    districtId: number,
    userId: number
  ): Promise<School[]>;

  getSchoolsDetailedByDistrictId(districtId: number, userId: number): Promise<School[]>;
  
  updateSchool(
    districtId: number,
    schoolId: number,
    schoolData: {
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
      schoolContactName?: string;
      schoolContactPhone?: string;
      schoolContactEmail?: string;
      notes?: string;
      overrideDistrictBilling?: boolean;
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
    },
    userId: number
  ): Promise<School>;
  
  archiveSchool(
    districtId: number,
    schoolId: number, 
    userId: number
  ): Promise<void>;

  activateSchool(
    districtId: number,
    schoolId: number, 
    userId: number
  ): Promise<void>;

  deleteSchool(
    districtId: number,
    schoolId: number,
    userId: number
  ): Promise<void>;

  getSchoolById(
    districtId: number,
    schoolId: number,
    userId: number
  ): Promise<School>;

  getSchoolDetails(
    districtId: number,
    schoolId: number
  ): Promise<GetSchoolDetailsResponse>;
}
