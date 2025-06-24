export interface Task {
  id: string;
  title: string;
  due_date: string;
  is_completed?: boolean;
  assigned_to: number;
}
