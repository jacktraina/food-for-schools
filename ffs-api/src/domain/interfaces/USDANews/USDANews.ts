export interface IUSDANewsProps {
  id?: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  guid?: string;
}

export class USDANews {
  id?: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  guid?: string;

  constructor({
    id,
    title,
    description,
    link,
    pubDate,
    guid,
  }: IUSDANewsProps) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.link = link;
    this.pubDate = pubDate;
    this.guid = guid;

    USDANews.validateTitle(title);
    USDANews.validateDescription(description);
    USDANews.validateLink(link);
    USDANews.validatePubDate(pubDate);
  }

  static validateTitle(title: string): void {
    if (!title || title.trim() === "") {
      throw new Error("title is required and cannot be empty");
    }
  }

  static validateDescription(description: string): void {
    if (!description || description.trim() === "") {
      throw new Error("description is required and cannot be empty");
    }
  }

  static validateLink(link: string): void {
    if (!link || link.trim() === "") {
      throw new Error("link is required and cannot be empty");
    }
    
    try {
      new URL(link);
    } catch {
      throw new Error("link must be a valid URL");
    }
  }

  static validatePubDate(pubDate: Date): void {
    if (!pubDate || !(pubDate instanceof Date) || isNaN(pubDate.getTime())) {
      throw new Error("pubDate must be a valid Date object");
    }
  }

  toJSON(): IUSDANewsProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      link: this.link,
      pubDate: this.pubDate,
      guid: this.guid,
    };
  }

  static create(props: {
    title: string;
    description: string;
    link: string;
    pubDate: Date;
    guid?: string;
  }): USDANews {
    return new USDANews({
      title: props.title,
      description: props.description,
      link: props.link,
      pubDate: props.pubDate,
      guid: props.guid,
    });
  }
}
