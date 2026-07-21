export interface MangaItem {
  id: string;
  title: string;
  chapter: string;
  status: 'Salvo' | 'Baixando' | 'Pausado' | 'Erro';
  coverUrl: string;
  author?: string;
  description?: string;
  format?: 'CBZ' | 'PDF' | 'ZIP' | 'RAW';
  fileSize?: string;
  downloadedAt?: string;
  pagesCount?: number;
  chapterPages?: {
    pageNumber: number;
    imageUrl: string;
    fileName: string;
  }[];
}

export interface DownloadTask {
  id: string;
  mangaTitle: string;
  chapterName: string;
  url: string;
  progress: number;
  speed: string;
  status: 'Downloading' | 'Queued' | 'Paused' | 'Completed' | 'Error';
  downloadedPages: number;
  totalPages: number;
  eta: string;
  coverUrl: string;
  outputDir: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'EXEC' | 'OK' | 'WAIT' | 'WARN' | 'ERROR';
  message: string;
}

export interface AppSettings {
  outputDirectory: string;
  concurrentDownloads: number;
  maxThreads: number;
  autoExtractCBZ: boolean;
  autoDownloadFromClipboard: boolean;
  browserNotifications: boolean;
  proxyEnabled: boolean;
  proxyAddress: string;
  retryAttempts: number;
  preferredQuality: 'Original' | 'High (Compressed)' | 'Medium';
  serverStatus: 'Online' | 'Offline' | 'Busy';
  theme: 'Dark Cyber' | 'Emerald Dark';
  accessToken?: string;
  email?: string;
  password?: string;
}
