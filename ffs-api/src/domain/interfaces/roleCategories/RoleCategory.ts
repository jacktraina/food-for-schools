export interface IRoleCategoryProps {
  id: number;
  name: string;
}

export class RoleCategory {
  id: number;
  name: string;

  constructor({ id, name }: IRoleCategoryProps) {
    this.id = id;
    this.name = name;
  }
}