export interface ITaskProps {
  id?: number;
  title: string;
  dueDate: Date;
  assignedTo?: number | null;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export class Task {
  id?: number;
  title: string;
  dueDate: Date;
  assignedTo?: number | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt?: Date | null;

  constructor(props: ITaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.dueDate = props.dueDate;
    this.assignedTo = props.assignedTo;
    this.isCompleted = props.isCompleted;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  getFormattedDueDate(): string {
    return this.dueDate.toISOString().split('T')[0];
  }

  markAsCompleted(): void {
    this.isCompleted = true;
    this.updatedAt = new Date();
  }

  markAsNotCompleted(): void {
    this.isCompleted = false;
    this.updatedAt = new Date();
  }

  assignTo(userId: number): void {
    this.assignedTo = userId;
    this.updatedAt = new Date();
  }

  unassign(): void {
    this.assignedTo = null;
    this.updatedAt = new Date();
  }

  static validateTitle(title: string): void {
    if (!title || title.trim() === '') {
      throw new Error('title is required');
    }
  }

  static validateDueDate(dueDate: string): Date {
    if (!dueDate) {
      throw new Error('dueDate is required');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      throw new Error('dueDate must be in YYYY-MM-DD format');
    }

    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('dueDate is not a valid date');
    }

    return parsedDate;
  }

  static validateAssignedTo(assignedTo: number | string | undefined | null): number | null {
    if (assignedTo === undefined || assignedTo === null) {
      return null; // Allow null for unassigned tasks
    }

    const parsedAssignedTo = Number(assignedTo);
    if (isNaN(parsedAssignedTo) || !Number.isInteger(parsedAssignedTo)) {
      throw new Error('assignedTo must be an integer');
    }

    return parsedAssignedTo;
  }

  static validateIsCompleted(isCompleted: boolean | string | undefined | null): boolean {
    if (isCompleted === undefined || isCompleted === null) {
      return false; // Default value if not provided
    }

    if (typeof isCompleted === 'boolean') {
      return isCompleted;
    }

    if (isCompleted === 'true') {
      return true;
    } else if (isCompleted === 'false') {
      return false;
    }

    throw new Error('isCompleted must be a boolean');
  }
}