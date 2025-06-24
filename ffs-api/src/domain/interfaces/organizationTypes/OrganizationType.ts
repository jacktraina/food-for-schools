export interface IOrganizationTypeProps {
  id: number;
  name: string;
}

export class OrganizationType {
  id: number;
  name: string;

  constructor({ id, name }: IOrganizationTypeProps) {
    this.id = id;
    this.name = name;
  }
}