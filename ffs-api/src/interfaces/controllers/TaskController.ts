import { inject, injectable } from 'inversify';
import { Response, Router } from 'express';
import TYPES from '../../shared/dependencyInjection/types';
import { ITaskService } from '../../application/contracts/ITaskService';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { protectRoute } from '../middleware/protectRoute';
import { TaskResponse } from '../responses/tasks/TaskResponse';
import { AuthRequest } from '../responses/base/AuthRequest';
import { validate, validateAll } from "../middleware/validate";
import { CreateTaskRequest, CreateTaskRequestSchema } from "../requests/tasks/CreateTaskRequest";
import { UpdateTaskRequest } from "../requests/tasks/UpdateTaskRequest";
import { UpdateTaskByIdRequestSchema } from "../requests/tasks/UpdateTaskByIdRequest";
import { DeleteTaskByIdRequestSchema } from "../requests/tasks/DeleteTaskByIdRequest";
import { CreateTaskResponse } from "../responses/tasks/CreateTaskResponse";
import { ForbiddenError } from '../../domain/core/errors/ForbiddenError';

@injectable()
export class TaskController {
  private readonly router: Router;

  constructor(@inject(TYPES.ITaskService) private taskService: ITaskService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get(
      '/',
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getTasks.bind(this))
    );

    this.router.post(
      "/",
      validate(CreateTaskRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.createTask.bind(this))
    );

    this.router.patch(
      "/:id",
      validateAll(UpdateTaskByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.updateTask.bind(this))
    );

    this.router.delete(
      "/:id",
      validateAll(DeleteTaskByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deleteTask.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async getTasks(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    
    const tasks = await this.taskService.getTasksForUser(userId);
    
    const tasksResponse: TaskResponse[] = tasks.map(task => ({
      id: task.id!,
      title: task.title,
      due_date: task.getFormattedDueDate(),
      assigned_to: task.assignedTo || null,
      is_completed: task.isCompleted
    }));
    
    res.status(200).json(tasksResponse);
  }

  private async createTask(req: AuthRequest, res: Response): Promise<void> {
    const { title, due_date, assigned_to, is_completed } = req.body as CreateTaskRequest;

    const task = await this.taskService.createTask({
      title,
      due_date,
      assigned_to,
      is_completed,
    });

    const response: CreateTaskResponse = {
      task,
    };

    res.status(201).json(response);
  }

  private async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id, 10);
    
    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }
    
    const task = await this.taskService.getTaskById(taskId);
    
    if (task.assignedTo !== userId) {
      throw new ForbiddenError('You are not authorized to delete this task');
    }
    
    await this.taskService.deleteTask(taskId);
    
    res.status(204).send();
  }

  private async updateTask(req: AuthRequest, res: Response): Promise<void> {
    const taskId = parseInt(req.params.id, 10);
    
    if (isNaN(taskId)) {
      res.status(400).json({ message: 'Invalid task ID' });
      return;
    }
    
    try {
      const { title, due_date, assigned_to, is_completed } = req.body as UpdateTaskRequest;
      
      const updatedTask = await this.taskService.updateTask(taskId, {
        title,
        due_date,
        assigned_to,
        is_completed
      });
      
      const taskResponse: TaskResponse = {
        id: updatedTask.id!,
        title: updatedTask.title,
        due_date: updatedTask.getFormattedDueDate(),
        assigned_to: updatedTask.assignedTo || null,
        is_completed: updatedTask.isCompleted
      };
      
      res.status(200).json(taskResponse);
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      
      throw error;
    }
  }
}
