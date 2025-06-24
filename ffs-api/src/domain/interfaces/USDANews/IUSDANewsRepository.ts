import { USDANews } from "./USDANews";

export interface IUSDANewsRepository {
  getLatestNews(): Promise<USDANews[]>;
}
