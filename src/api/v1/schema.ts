export interface ImageRequest {
  url: string | undefined;
}

export interface ImageResponse {
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
