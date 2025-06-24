import { PrismaClient } from "@prisma/client";
import { IDatabaseService } from "../../../../src/application/contracts/IDatabaseService";
import { Task } from "../../../../src/domain/interfaces/tasks/Task";
import { TaskRepository } from "../../../../src/infrastructure/repositories/TaskRepository";

jest.mock('@prisma/client');

const mockTaskModel = {
  findMany: jest.fn(),
};

const mockPrismaClient = {
  task: mockTaskModel,
};

const mockDatabaseService: jest.Mocked<IDatabaseService> = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  getClient: jest.fn().mockReturnValue(mockPrismaClient as unknown as PrismaClient),
  runInTransaction: jest.fn(),
};

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    taskRepository = new TaskRepository(mockDatabaseService);
  });

  describe('findByAssignedUser', () => {
    it('should return tasks assigned to a specific user', async () => {
      const mockTasksData = [
        {
          id: 1,
          title: 'Review vendor registration',
          dueDate: new Date('2025-05-20'),
          assignedTo: 123,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: null
        },
        {
          id: 2,
          title: 'Approve vendor',
          dueDate: new Date('2025-05-25'),
          assignedTo: 123,
          isCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockTaskModel.findMany.mockResolvedValue(mockTasksData);

      const result = await taskRepository.findByAssignedUser(123);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Task);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe('Review vendor registration');
      expect(result[0].assignedTo).toBe(123);
      expect(result[0].isCompleted).toBe(false);
      expect(result[1]).toBeInstanceOf(Task);
      expect(result[1].id).toBe(2);
      expect(result[1].title).toBe('Approve vendor');
      expect(result[1].assignedTo).toBe(123);
      expect(result[1].isCompleted).toBe(true);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: { assignedTo: 123 }
      });
    });

    it('should return an empty array when no tasks are found', async () => {
      mockTaskModel.findMany.mockResolvedValue([]);

      const result = await taskRepository.findByAssignedUser(456);

      expect(result).toHaveLength(0);
      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: { assignedTo: 456 }
      });
    });

    it('should handle database errors', async () => {
      mockTaskModel.findMany.mockRejectedValue(new Error('Database error'));

      await expect(taskRepository.findByAssignedUser(123)).rejects.toThrow('Database error');
    });
  });
});