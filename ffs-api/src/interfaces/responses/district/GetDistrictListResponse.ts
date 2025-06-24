export interface GetDistrictListResponse {
  id: number;
  name?: string | null;
  location?: string | null;
  schools: number;
  students: number;
  status?: string | null;
}
