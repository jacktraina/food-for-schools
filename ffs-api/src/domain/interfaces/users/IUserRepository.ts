import { User } from './User';

export interface IUserRepository {
  getUserDetails(userId: number): Promise<User | null>;
  
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(entity: User): Promise<User>;
  findDistrictById(districtId: number): Promise<{ id: number; cooperativeId: number } | null>;
  findAllUsers(): Promise<User[]>;
  searchUsers(filters: {
    search?: string;
    role?: string;
    bidRole?: string;
    status?: string;
    district?: string;
  }): Promise<User[]>;
  create(user: User): Promise<User>;
  updatePassword(userId: number, password: string): Promise<void>;
  markAsEmailVerified(userId: number): Promise<void>;
  findManyByIds(ids: number[]): Promise<User[]>;
  softDelete(id: number): Promise<void>;
}
