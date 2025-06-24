export interface ListCategoriesResponseItem {
  id: number;
  external_id: string;
  name: string;
  description?: string;
}

export type ListCategoriesResponse = ListCategoriesResponseItem[];
