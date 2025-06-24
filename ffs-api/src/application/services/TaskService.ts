import { inject, injectable } from 'inversify';
import { ITaskService } from '../contracts/ITaskService';
import { ITaskRepository } from '../../domain/interfaces/tasks/ITaskRepository';
import { Task } from '../../domain/interfaces/tasks/Task';
import TYPES from '../../shared/dependencyInjection/types';
import { BadRequestError } from '../../domain/core/errors/BadRequestError';
import { NotFoundError } from '../../domain/core/errors/NotFoundError';

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TYPES.ITaskRepository) private taskRepository: ITaskRepository
  ) {}

  async createTask(taskData: {
    title: string;
    due_date: string;
    assigned_to: number | string;
    is_completed?: boolean | string;
  }): Promise<Task> {
    try {
      Task.validateTitle(taskData.title);
      const dueDate = Task.validateDueDate(taskData.due_date);
      const assignedTo = Task.validateAssignedTo(taskData.assigned_to);
      const isCompleted = Task.validateIsCompleted(taskData.is_completed);

      const task = new Task({
        title: taskData.title,
        dueDate,
        assignedTo,
        isCompleted,
      });

      return await this.taskRepository.create(task);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError('Failed to create task');
    }
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.taskRepository.findAll();
  }

  async getTasksForUser(userId: number): Promise<Task[]> {
    return await this.taskRepository.findByAssignedUser(userId);
  }

  async updateTask(id: number, taskData: {
    title?: string;
    due_date?: string;
    assigned_to?: number | string;
    is_completed?: boolean | string;
  }): Promise<Task> {
    const existingTask = await this.getTaskById(id);
    
    if (taskData.title !== undefined) {
      Task.validateTitle(taskData.title);
      existingTask.title = taskData.title;
    }
    
    if (taskData.due_date !== undefined) {
      existingTask.dueDate = Task.validateDueDate(taskData.due_date);
    }
    
    if (taskData.assigned_to !== undefined) {
      existingTask.assignedTo = Task.validateAssignedTo(taskData.assigned_to);
    }
    
    if (taskData.is_completed !== undefined) {
      existingTask.isCompleted = Task.validateIsCompleted(taskData.is_completed);
    }
    
    const updatedTask = await this.taskRepository.update(existingTask);
    if (!updatedTask) {
      throw new BadRequestError('Failed to update task');
    }
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    const success = await this.taskRepository.delete(id);
    if (!success) {
      throw new NotFoundError('Task not found or could not be deleted');
    }
  }
}
