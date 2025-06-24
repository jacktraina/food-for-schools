import { ITaskRepository } from "../../../../src/domain/interfaces/tasks/ITaskRepository";
import { Task } from "../../../../src/domain/interfaces/tasks/Task";
import { TaskService } from "../../../../src/application/services/TaskService";
import { BadRequestError } from "../../../../src/domain/core/errors/BadRequestError";
import { NotFoundError } from "../../../../src/domain/core/errors/NotFoundError";

const createMockRepository = () => {
  return {
    findByAssignedUser: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
};

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = createMockRepository() as jest.Mocked<ITaskRepository>;
    taskService = new TaskService(mockTaskRepository);
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        due_date: '2025-12-31',
        assigned_to: 123,
        is_completed: false
      };

      const mockCreatedTask = new Task({
        id: 1,
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        assignedTo: 123,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: null
      });

      mockTaskRepository.create.mockResolvedValue(mockCreatedTask);

      const result = await taskService.createTask(taskData);

      expect(result).toEqual(mockCreatedTask);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          dueDate: new Date('2025-12-31'),
          assignedTo: 123,
          isCompleted: false
        })
      );
    });

    it('should create a task with string assigned_to', async () => {
      const taskData = {
        title: 'Test Task',
        due_date: '2025-12-31',
        assigned_to: '123'
      };

      const mockCreatedTask = new Task({
        id: 1,
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        assignedTo: 123,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: null
      });

      mockTaskRepository.create.mockResolvedValue(mockCreatedTask);

      const result = await taskService.createTask(taskData);

      expect(result).toEqual(mockCreatedTask);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedTo: 123
        })
      );
    });

    it('should throw BadRequestError for invalid title', async () => {
      const taskData = {
        title: '',
        due_date: '2025-12-31',
        assigned_to: 123
      };

      await expect(taskService.createTask(taskData)).rejects.toThrow(BadRequestError);
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid due_date format', async () => {
      const taskData = {
        title: 'Test Task',
        due_date: 'invalid-date',
        assigned_to: 123
      };

      await expect(taskService.createTask(taskData)).rejects.toThrow(BadRequestError);
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid assigned_to', async () => {
      const taskData = {
        title: 'Test Task',
        due_date: '2025-12-31',
        assigned_to: 'invalid'
      };

      await expect(taskService.createTask(taskData)).rejects.toThrow(BadRequestError);
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError when repository fails', async () => {
      const taskData = {
        title: 'Test Task',
        due_date: '2025-12-31',
        assigned_to: 123
      };

      mockTaskRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(taskService.createTask(taskData)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getTaskById', () => {
    it('should return a task when found', async () => {
      const mockTask = new Task({
        id: 1,
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        assignedTo: 123,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: null
      });

      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(1);

      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.getTaskById(999)).rejects.toThrow(NotFoundError);
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = [
        new Task({
          id: 1,
          title: 'Task 1',
          dueDate: new Date('2025-12-31'),
          assignedTo: 123,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: null
        }),
        new Task({
          id: 2,
          title: 'Task 2',
          dueDate: new Date('2025-12-31'),
          assignedTo: 456,
          isCompleted: true,
          createdAt: new Date(),
          updatedAt: null
        })
      ];

      mockTaskRepository.findAll.mockResolvedValue(mockTasks);

      const result = await taskService.getAllTasks();

      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(2);
      expect(mockTaskRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no tasks exist', async () => {
      mockTaskRepository.findAll.mockResolvedValue([]);

      const result = await taskService.getAllTasks();

      expect(result).toEqual([]);
      expect(mockTaskRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getTasksForUser', () => {
    it('should return tasks for a specific user', async () => {
      const mockTasks = [
        new Task({
          id: 1,
          title: 'Review vendor registration',
          dueDate: new Date('2025-05-20'),
          assignedTo: 123,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: null
        }),
        new Task({
          id: 2,
          title: 'Approve vendor',
          dueDate: new Date('2025-05-25'),
          assignedTo: 123,
          isCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ];

      mockTaskRepository.findByAssignedUser.mockResolvedValue(mockTasks);

      const result = await taskService.getTasksForUser(123);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Task);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe('Review vendor registration');
      expect(result[1]).toBeInstanceOf(Task);
      expect(result[1].id).toBe(2);
      expect(result[1].title).toBe('Approve vendor');

      expect(mockTaskRepository.findByAssignedUser).toHaveBeenCalledWith(123);
    });

    it('should return an empty array when no tasks are found', async () => {
      mockTaskRepository.findByAssignedUser.mockResolvedValue([]);

      const result = await taskService.getTasksForUser(456);

      expect(result).toHaveLength(0);
      expect(mockTaskRepository.findByAssignedUser).toHaveBeenCalledWith(456);
    });

    it('should handle repository errors', async () => {
      mockTaskRepository.findByAssignedUser.mockRejectedValue(new Error('Repository error'));

      await expect(taskService.getTasksForUser(123)).rejects.toThrow('Repository error');
    });
  });

  describe('updateTask', () => {
    const existingTask = new Task({
      id: 1,
      title: 'Original Title',
      dueDate: new Date('2025-12-31'),
      assignedTo: 123,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: null
    });

    beforeEach(() => {
      mockTaskRepository.findById.mockResolvedValue(existingTask);
    });

    it('should update task title', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedTask = { ...existingTask, title: 'Updated Title' };

      mockTaskRepository.update.mockResolvedValue(updatedTask as Task);

      const result = await taskService.updateTask(1, updateData);

      expect(result.title).toBe('Updated Title');
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTaskRepository.update).toHaveBeenCalled();
    });

    it('should update task due_date', async () => {
      const updateData = { due_date: '2026-01-01' };
      const updatedTask = { ...existingTask, dueDate: new Date('2026-01-01') };

      mockTaskRepository.update.mockResolvedValue(updatedTask as Task);

      const result = await taskService.updateTask(1, updateData);

      expect(result.dueDate).toEqual(new Date('2026-01-01'));
      expect(mockTaskRepository.update).toHaveBeenCalled();
    });

    it('should update task assigned_to', async () => {
      const updateData = { assigned_to: 456 };
      const updatedTask = { ...existingTask, assignedTo: 456 };

      mockTaskRepository.update.mockResolvedValue(updatedTask as Task);

      const result = await taskService.updateTask(1, updateData);

      expect(result.assignedTo).toBe(456);
      expect(mockTaskRepository.update).toHaveBeenCalled();
    });

    it('should update task is_completed', async () => {
      const updateData = { is_completed: true };
      const updatedTask = { ...existingTask, isCompleted: true };

      mockTaskRepository.update.mockResolvedValue(updatedTask as Task);

      const result = await taskService.updateTask(1, updateData);

      expect(result.isCompleted).toBe(true);
      expect(mockTaskRepository.update).toHaveBeenCalled();
    });

    it('should update multiple fields', async () => {
      const updateData = {
        title: 'New Title',
        due_date: '2026-01-01',
        assigned_to: 789,
        is_completed: true
      };
      const updatedTask = {
        ...existingTask,
        title: 'New Title',
        dueDate: new Date('2026-01-01'),
        assignedTo: 789,
        isCompleted: true
      };

      mockTaskRepository.update.mockResolvedValue(updatedTask as Task);

      const result = await taskService.updateTask(1, updateData);

      expect(result.title).toBe('New Title');
      expect(result.dueDate).toEqual(new Date('2026-01-01'));
      expect(result.assignedTo).toBe(789);
      expect(result.isCompleted).toBe(true);
    });

    it('should throw NotFoundError when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.updateTask(999, { title: 'New Title' })).rejects.toThrow(NotFoundError);
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid title', async () => {
      const updateData = { title: '' };

      await expect(taskService.updateTask(1, updateData)).rejects.toThrow(Error);
    });

    it('should throw BadRequestError for invalid due_date', async () => {
      const updateData = { due_date: 'invalid-date' };

      await expect(taskService.updateTask(1, updateData)).rejects.toThrow(Error);
    });

    it('should throw BadRequestError when update fails', async () => {
      const updateData = { title: 'New Title' };

      mockTaskRepository.update.mockResolvedValue(null);

      await expect(taskService.updateTask(1, updateData)).rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      mockTaskRepository.delete.mockResolvedValue(true);

      await expect(taskService.deleteTask(1)).resolves.not.toThrow();
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when task cannot be deleted', async () => {
      mockTaskRepository.delete.mockResolvedValue(false);

      await expect(taskService.deleteTask(999)).rejects.toThrow(NotFoundError);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith(999);
    });
  });
});
