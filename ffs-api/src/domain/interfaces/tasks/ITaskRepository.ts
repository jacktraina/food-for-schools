import { Task } from './Task';

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: number): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByAssignedUser(userId: number): Promise<Task[]>;
  update(task: Task): Promise<Task | null>;
  delete(id: number): Promise<boolean>;
}
