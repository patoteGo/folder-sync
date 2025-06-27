export interface FolderRelationship {
  id: string;
  sourcePath: string;
  destinationPath: string;
  originalName: string;
  customName: string;
  lastSync: Date | null;
  status: 'synced' | 'out-of-sync' | 'error' | 'pending' | 'syncing';
  filesCount?: number;
  size?: string;
  autoSync?: boolean;
}

export interface SyncStats {
  total: number;
  synced: number;
  outOfSync: number;
  errors: number;
}

export interface CronSettings {
  enabled: boolean;
  interval: number; // in minutes
  lastRun: Date | null;
  nextRun: Date | null;
  isRunning: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: Date;
  type: 'manual' | 'auto';
  relationshipId: string;
  relationshipName: string;
  status: 'success' | 'error';
  message: string;
  duration?: number; // in milliseconds
}