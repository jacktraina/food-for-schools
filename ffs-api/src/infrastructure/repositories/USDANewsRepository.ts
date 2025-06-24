import { injectable } from "inversify";
import axios from "axios";
import * as xml2js from "xml2js";
import { IUSDANewsRepository } from "../../domain/interfaces/USDANews/IUSDANewsRepository";
import { USDANews } from "../../domain/interfaces/USDANews/USDANews";

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate?: string;
  guid?: string | { _: string; $: { isPermaLink: string } };
}

interface RSSChannel {
  item: RSSItem | RSSItem[];
}

interface RSSFeed {
  rss?: {
    channel?: RSSChannel;
  };
}

interface CacheEntry {
  data: USDANews[];
  timestamp: number;
}

@injectable()
export class USDANewsRepository implements IUSDANewsRepository {
  private cache: CacheEntry | null = null;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly RSS_URL = "https://www.fns.usda.gov/rss-feeds/newsroom";

  async getLatestNews(): Promise<USDANews[]> {
    try {
      if (this.isCacheValid()) {
        return this.cache!.data;
      }

      const response = await axios.get(this.RSS_URL, {
        timeout: 10000,
        headers: {
          'User-Agent': 'FFS-API/1.0'
        }
      });

      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: false,
        trim: true
      });

      const result: RSSFeed = await parser.parseStringPromise(response.data);
      const items = result.rss?.channel?.item || [];
      
      const newsItems = Array.isArray(items) ? items : [items];
      
      const usdaNews = newsItems
        .filter((item: RSSItem) => item && item.title && item.description && item.link)
        .map((item: RSSItem) => {
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          
          return USDANews.create({
            title: this.cleanHtml(item.title),
            description: this.cleanHtml(item.description),
            link: item.link,
            pubDate: pubDate,
            guid: typeof item.guid === 'object' && item.guid?.$ && item.guid.$.isPermaLink === 'false' 
              ? item.guid._ 
              : (typeof item.guid === 'string' ? item.guid : item.link)
          });
        })
        .slice(0, 10); // Limit to 10 most recent items

      this.cache = {
        data: usdaNews,
        timestamp: Date.now()
      };

      return usdaNews;
    } catch (error) {
      console.error('Error fetching USDA news:', error);
      
      if (this.cache) {
        console.warn('Returning cached USDA news due to fetch error');
        return this.cache.data;
      }
      
      return [];
    }
  }

  private isCacheValid(): boolean {
    if (!this.cache) {
      return false;
    }
    
    const now = Date.now();
    return (now - this.cache.timestamp) < this.CACHE_DURATION;
  }

  private cleanHtml(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}
