export interface TaskResponse {
  id: number;
  title: string;
  due_date: string;
  assigned_to: number | null;
  is_completed: boolean;
}
