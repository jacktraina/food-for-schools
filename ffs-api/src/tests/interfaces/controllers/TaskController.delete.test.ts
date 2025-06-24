import { TaskController } from '../../../interfaces/controllers/TaskController';
import { ITaskService } from '../../../application/contracts/ITaskService';
import { Task } from '../../../domain/interfaces/tasks/Task';
import { ForbiddenError } from '../../../domain/core/errors/ForbiddenError';
import { NotFoundError } from '../../../domain/core/errors/NotFoundError';
import { Request, Response } from 'express';

interface MockRequest extends Partial<Request> {
  params: {
    id: string;
  };
  user: {
    id: number;
  };
}

describe('TaskController - deleteTask', () => {
  let taskController: TaskController;
  let mockTaskService: jest.Mocked<ITaskService>;
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let deleteTaskMethod: (req: Request, res: Response) => Promise<void>;

  beforeEach(() => {
    mockTaskService = {
      getTaskById: jest.fn(),
      deleteTask: jest.fn(),
      createTask: jest.fn(),
      getAllTasks: jest.fn(),
      getTasksForUser: jest.fn(),
      updateTask: jest.fn(),
    } as jest.Mocked<ITaskService>;

    taskController = new TaskController(mockTaskService);
    deleteTaskMethod = (taskController as unknown as { deleteTask: (req: Request, res: Response) => Promise<void> })['deleteTask'];

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it('should return 204 when task is successfully deleted', async () => {
    const taskId = 15;
    const userId = 1;
    
    mockRequest = {
      params: { id: taskId.toString() },
      user: { id: userId },
    };

    const mockTask = new Task({
      id: taskId,
      title: 'Test Task',
      dueDate: new Date(),
      assignedTo: userId,
      isCompleted: false,
    });

    mockTaskService.getTaskById.mockResolvedValue(mockTask);
    mockTaskService.deleteTask.mockResolvedValue();

    await deleteTaskMethod.call(taskController, mockRequest as Request, mockResponse as Response);

    expect(mockTaskService.getTaskById).toHaveBeenCalledWith(taskId);
    expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
  });

  it('should return 400 when task ID is invalid', async () => {
    mockRequest = {
      params: { id: 'invalid-id' },
      user: { id: 1 },
    };

    await deleteTaskMethod.call(taskController, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid task ID' });
    expect(mockTaskService.getTaskById).not.toHaveBeenCalled();
    expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when user does not own the task', async () => {
    const taskId = 15;
    const userId = 1;
    const otherUserId = 2;
    
    mockRequest = {
      params: { id: taskId.toString() },
      user: { id: userId },
    };

    const mockTask = new Task({
      id: taskId,
      title: 'Test Task',
      dueDate: new Date(),
      assignedTo: otherUserId, // Task is assigned to a different user
      isCompleted: false,
    });

    mockTaskService.getTaskById.mockResolvedValue(mockTask);

    await expect(deleteTaskMethod.call(taskController, mockRequest as Request, mockResponse as Response))
      .rejects.toThrow(ForbiddenError);
    
    expect(mockTaskService.getTaskById).toHaveBeenCalledWith(taskId);
    expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
  });

  it('should propagate NotFoundError when task does not exist', async () => {
    const taskId = 9999;
    const userId = 1;
    
    mockRequest = {
      params: { id: taskId.toString() },
      user: { id: userId },
    };

    mockTaskService.getTaskById.mockRejectedValue(new NotFoundError('Task not found'));

    await expect(deleteTaskMethod.call(taskController, mockRequest as Request, mockResponse as Response))
      .rejects.toThrow(NotFoundError);
    
    expect(mockTaskService.getTaskById).toHaveBeenCalledWith(taskId);
    expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
  });
});