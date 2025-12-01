export type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Video {
  id: string;
  topic: string;
  duration: number;
  style: string;
  status: VideoStatus;
  script: string | null;
  video_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  type: 'video' | 'image';
  url: string;
  id: number;
}

export interface GenerateParams {
  topic: string;
  duration: 15 | 30 | 60;
  style: 'motivational' | 'business' | 'emotional' | 'facts';
}
