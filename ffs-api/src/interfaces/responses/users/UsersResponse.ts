export interface UsersResponseItem {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
  userRole: string;
  totalEvents: number;
}

export interface UsersResponse {
  users: UsersResponseItem[];
}