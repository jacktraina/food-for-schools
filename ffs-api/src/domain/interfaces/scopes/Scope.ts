import { ScopeType } from "../scopeTypes/ScopeType";

export interface IScopeProps {
  id: number;
  typeId: number;
  name?: string | null;

  scopeType?: Partial<ScopeType>;
}

export class Scope {
  id: number;
  typeId: number;
  name?: string | null;

  scopeType?: Partial<ScopeType>;

  constructor({ id, typeId, name, scopeType }: IScopeProps) {
    this.id = id;
    this.typeId = typeId;
    this.name = name;
    this.scopeType = scopeType;
  }
}