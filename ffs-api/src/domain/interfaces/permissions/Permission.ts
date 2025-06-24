export interface IPermissionProps {
  id: number;
  name: string;
}

export class Permission {
  id: number;
  name: string;

  constructor({ id, name }: IPermissionProps) {
    this.id = id;
    this.name = name;
  }
}