import { Task } from '../../domain/interfaces/tasks/Task';

export interface ITaskService {
  createTask(taskData: {
    title: string;
    due_date: string;
    assigned_to: number | string;
    is_completed?: boolean | string;
  }): Promise<Task>;
  
  getTaskById(id: number): Promise<Task>;
  
  getAllTasks(): Promise<Task[]>;
  
  getTasksForUser(userId: number): Promise<Task[]>;
  
  updateTask(id: number, taskData: {
    title?: string;
    due_date?: string;
    assigned_to?: number | string;
    is_completed?: boolean | string;
  }): Promise<Task>;
  
  deleteTask(id: number): Promise<void>;
}
