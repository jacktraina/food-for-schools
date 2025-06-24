import { Cooperative } from "../Cooperatives/Cooperative";
import { District } from "../Districts/District";

export interface INotificationProps {
  id: number;
  title: string;
  details: string;
  createdAt: Date;
  type: string;
  districtId?: number | null;
  cooperativeId?: number | null;
  district?: District;
  cooperative?: Cooperative;
}

export class Notification {
  id: number;
  title: string;
  details: string;
  createdAt: Date;
  type: string;
  districtId?: number | null;
  cooperativeId?: number | null;
  district?: District;
  cooperative?: Cooperative;

  constructor({
    id,
    title,
    details,
    createdAt,
    type,
    districtId,
    cooperativeId,
    district,
    cooperative
  }: INotificationProps) {
    this.id = id;
    this.title = title;
    this.details = details;
    this.createdAt = createdAt;
    this.type = type;
    this.districtId = districtId;
    this.cooperativeId = cooperativeId;
    this.district = district;
    this.cooperative = cooperative;
  }

  getDisplayTitle(): string {
    return this.title;
  }
}