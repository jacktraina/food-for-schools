import { Task } from '../../../../../src/domain/interfaces/tasks/Task';

describe('Task', () => {
  describe('constructor', () => {
    it('should create a task with all properties', () => {
      const taskProps = {
        id: 1,
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        assignedTo: 123,
        isCompleted: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02')
      };

      const task = new Task(taskProps);

      expect(task.id).toBe(1);
      expect(task.title).toBe('Test Task');
      expect(task.dueDate).toEqual(new Date('2025-12-31'));
      expect(task.assignedTo).toBe(123);
      expect(task.isCompleted).toBe(false);
      expect(task.createdAt).toEqual(new Date('2025-01-01'));
      expect(task.updatedAt).toEqual(new Date('2025-01-02'));
    });

    it('should create a task with default createdAt when not provided', () => {
      const taskProps = {
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        isCompleted: false
      };

      const task = new Task(taskProps);

      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeUndefined();
    });
  });

  describe('getFormattedDueDate', () => {
    it('should return formatted due date in YYYY-MM-DD format', () => {
      const task = new Task({
        title: 'Test Task',
        dueDate: new Date('2025-12-31T10:30:00Z'),
        isCompleted: false
      });

      expect(task.getFormattedDueDate()).toBe('2025-12-31');
    });
  });

  describe('markAsCompleted', () => {
    it('should mark task as completed and update timestamp', () => {
      const task = new Task({
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        isCompleted: false
      });

      const beforeUpdate = new Date();
      task.markAsCompleted();

      expect(task.isCompleted).toBe(true);
      expect(task.updatedAt).toBeInstanceOf(Date);
      expect(task.updatedAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('markAsNotCompleted', () => {
    it('should mark task as not completed and update timestamp', () => {
      const task = new Task({
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        isCompleted: true
      });

      const beforeUpdate = new Date();
      task.markAsNotCompleted();

      expect(task.isCompleted).toBe(false);
      expect(task.updatedAt).toBeInstanceOf(Date);
      expect(task.updatedAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('assignTo', () => {
    it('should assign task to user and update timestamp', () => {
      const task = new Task({
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        isCompleted: false
      });

      const beforeUpdate = new Date();
      task.assignTo(123);

      expect(task.assignedTo).toBe(123);
      expect(task.updatedAt).toBeInstanceOf(Date);
      expect(task.updatedAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('unassign', () => {
    it('should unassign task and update timestamp', () => {
      const task = new Task({
        title: 'Test Task',
        dueDate: new Date('2025-12-31'),
        assignedTo: 123,
        isCompleted: false
      });

      const beforeUpdate = new Date();
      task.unassign();

      expect(task.assignedTo).toBeNull();
      expect(task.updatedAt).toBeInstanceOf(Date);
      expect(task.updatedAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });
  });

  describe('validateTitle', () => {
    it('should not throw for valid title', () => {
      expect(() => Task.validateTitle('Valid Title')).not.toThrow();
    });

    it('should throw error for empty title', () => {
      expect(() => Task.validateTitle('')).toThrow('title is required');
    });

    it('should throw error for whitespace-only title', () => {
      expect(() => Task.validateTitle('   ')).toThrow('title is required');
    });

    it('should throw error for null title', () => {
      expect(() => Task.validateTitle(null as any)).toThrow('title is required');
    });

    it('should throw error for undefined title', () => {
      expect(() => Task.validateTitle(undefined as any)).toThrow('title is required');
    });
  });

  describe('validateDueDate', () => {
    it('should return valid date for correct format', () => {
      const result = Task.validateDueDate('2025-12-31');
      expect(result).toEqual(new Date('2025-12-31'));
    });

    it('should throw error for empty due date', () => {
      expect(() => Task.validateDueDate('')).toThrow('dueDate is required');
    });

    it('should throw error for null due date', () => {
      expect(() => Task.validateDueDate(null as any)).toThrow('dueDate is required');
    });

    it('should throw error for undefined due date', () => {
      expect(() => Task.validateDueDate(undefined as any)).toThrow('dueDate is required');
    });

    it('should throw error for invalid date format', () => {
      expect(() => Task.validateDueDate('12/31/2025')).toThrow('dueDate must be in YYYY-MM-DD format');
    });

    it('should throw error for invalid date', () => {
      expect(() => Task.validateDueDate('2025-13-32')).toThrow('dueDate is not a valid date');
    });

    it('should throw error for non-date string', () => {
      expect(() => Task.validateDueDate('not-a-date')).toThrow('dueDate must be in YYYY-MM-DD format');
    });
  });

  describe('validateAssignedTo', () => {
    it('should return number for valid integer', () => {
      expect(Task.validateAssignedTo(123)).toBe(123);
    });

    it('should return number for valid string integer', () => {
      expect(Task.validateAssignedTo('123')).toBe(123);
    });

    it('should return null for undefined', () => {
      expect(Task.validateAssignedTo(undefined)).toBeNull();
    });

    it('should return null for null', () => {
      expect(Task.validateAssignedTo(null)).toBeNull();
    });

    it('should throw error for non-integer string', () => {
      expect(() => Task.validateAssignedTo('abc')).toThrow('assignedTo must be an integer');
    });

    it('should throw error for decimal number', () => {
      expect(() => Task.validateAssignedTo(123.45)).toThrow('assignedTo must be an integer');
    });

    it('should throw error for decimal string', () => {
      expect(() => Task.validateAssignedTo('123.45')).toThrow('assignedTo must be an integer');
    });
  });

  describe('validateIsCompleted', () => {
    it('should return true for boolean true', () => {
      expect(Task.validateIsCompleted(true)).toBe(true);
    });

    it('should return false for boolean false', () => {
      expect(Task.validateIsCompleted(false)).toBe(false);
    });

    it('should return true for string "true"', () => {
      expect(Task.validateIsCompleted('true')).toBe(true);
    });

    it('should return false for string "false"', () => {
      expect(Task.validateIsCompleted('false')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(Task.validateIsCompleted(undefined)).toBe(false);
    });

    it('should return false for null', () => {
      expect(Task.validateIsCompleted(null)).toBe(false);
    });

    it('should throw error for invalid string', () => {
      expect(() => Task.validateIsCompleted('invalid')).toThrow('isCompleted must be a boolean');
    });

    it('should throw error for number', () => {
      expect(() => Task.validateIsCompleted(1 as any)).toThrow('isCompleted must be a boolean');
    });
  });
});
