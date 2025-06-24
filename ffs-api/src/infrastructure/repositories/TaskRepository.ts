import { inject, injectable } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import { ITaskRepository } from '../../domain/interfaces/tasks/ITaskRepository';
import { Task } from '../../domain/interfaces/tasks/Task';
import TYPES from '../../shared/dependencyInjection/types';
import { PrismaClient } from '@prisma/client';

@injectable()
export class TaskRepository implements ITaskRepository {
  private taskModel: PrismaClient['task'];
  
  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.taskModel = database.getClient().task;
  }

  async create(task: Task): Promise<Task> {
    const createdTask = await this.taskModel.create({
      data: {
        title: task.title,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
        isCompleted: task.isCompleted,
      },
    });

    return new Task({
      id: createdTask.id,
      title: createdTask.title,
      dueDate: createdTask.dueDate,
      assignedTo: createdTask.assignedTo,
      isCompleted: createdTask.isCompleted,
      createdAt: createdTask.createdAt,
      updatedAt: createdTask.updatedAt,
    });
  }

  async findById(id: number): Promise<Task | null> {
    const task = await this.taskModel.findUnique({
      where: { id },
    });

    if (!task) return null;

    return new Task({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.taskModel.findMany();

    return tasks.map(
      (task) =>
        new Task({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate,
          assignedTo: task.assignedTo,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })
    );
  }

  async findByAssignedUser(userId: number): Promise<Task[]> {
    const tasks = await this.taskModel.findMany({
      where: {
        assignedTo: userId
      }
    });

    return tasks.map(task => new Task({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));
  }

  async update(task: Task): Promise<Task | null> {
    if (!task.id) return null;

    const updatedTask = await this.taskModel.update({
      where: { id: task.id },
      data: {
        title: task.title,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
        isCompleted: task.isCompleted,
        updatedAt: new Date(),
      },
    });

    return new Task({
      id: updatedTask.id,
      title: updatedTask.title,
      dueDate: updatedTask.dueDate,
      assignedTo: updatedTask.assignedTo,
      isCompleted: updatedTask.isCompleted,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.taskModel.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}