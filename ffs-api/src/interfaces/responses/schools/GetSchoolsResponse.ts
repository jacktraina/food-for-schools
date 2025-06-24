export interface SchoolResponseItem {
  id: number;
  name: string;
  school_type: string;
  enrollment: number | null | undefined;
  status: string;
}

export type GetSchoolsResponse = SchoolResponseItem[];
