export interface SchoolDetailedResponseItem {
  id: number;
  name: string;
  enrollment: number | null;
  shippingAddress: string;
  primaryContactFirstName: string | null;
  primaryContactLastName: string | null;
  billingContactFirstName: string | null;
  billingContactLastName: string | null;
  status: string;
}

export type GetSchoolsDetailedResponse = SchoolDetailedResponseItem[];
