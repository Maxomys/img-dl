export interface ImageRequestQuery extends qs.ParsedQs{
  url: string;
}

export interface PostImageResponse {
  image_url: string;
}

export interface GetImageResponse {
  status: ImageStatus;
  source_url: string;
  added_at: string;
  url: string | null;
  downloaded_at: string | null;
}

export enum ImageStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export interface Page<T> {
  page: number;
  pages: number;
  limit: number;
  total: number;
  data: T[];
}
