export interface IScopeTypeProps {
  id: number;
  name: string;
}

export class ScopeType {
  id: number;
  name: string;

  constructor({ id, name }: IScopeTypeProps) {
    this.id = id;
    this.name = name;
  }
}