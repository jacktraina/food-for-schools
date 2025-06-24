export interface IUserStatusProps {
  id: number;
  name: string;
}

export class UserStatus {
  id: number;
  name: string;

  constructor({ id, name }: IUserStatusProps) {
    this.id = id;
    this.name = name;
  }
}