export interface IVendorStatusProps {
  id: number;
  name: string;
}

export class VendorStatus {
  id: number;
  name: string;

  constructor({ id, name }: IVendorStatusProps) {
    this.id = id;
    this.name = name;
  }
}