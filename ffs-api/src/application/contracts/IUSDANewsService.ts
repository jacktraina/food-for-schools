import { USDANews } from "../../domain/interfaces/USDANews/USDANews";

export interface IUSDANewsService {
  getLatestNews(): Promise<USDANews[]>;
}
